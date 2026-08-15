import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import StockBadge from '../components/StockBadge';
import toast from 'react-hot-toast';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  description: '',
  quantity: 0,
  minStock: 5,
  unitPrice: 0,
  supplier: '',
};

export default function Products() {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const canEdit = hasRole('admin', 'manager');

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filter) params.set('stockStatus', filter);
    const { data } = await api.get(`/products?${params.toString()}`);
    setProducts(data);
  }, [search, filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loadMeta = async () => {
      const [cat, sup] = await Promise.all([api.get('/products/categories'), api.get('/suppliers')]);
      setCategories(cat.data);
      setSuppliers(sup.data);
    };
    loadMeta();

    const socket = getSocket();
    socket.on('product:update', (payload) => {
      if (payload.action === 'deleted') {
        toast('Product deleted', { icon: '🗑️' });
      } else {
        toast(`Product ${payload.action}`, { icon: '📦' });
      }
      load();
    });
    return () => socket.off('product:update');
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category || '',
      description: p.description || '',
      quantity: p.quantity,
      minStock: p.minStock,
      unitPrice: p.unitPrice,
      supplier: p.supplier?._id || p.supplier || '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getStatus = (p) => {
    if (p.quantity <= 0) return 'out_of_stock';
    if (p.quantity <= p.minStock) return 'low';
    return 'in_stock';
  };

  const inputCls =
    'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage your product catalog and stock levels</p>
        </div>
        {canEdit && (
          <button
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Add Product
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Name / SKU</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Supplier</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Quantity</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.sku}</div>
                </td>
                <td className="px-4 py-3">{p.category || '—'}</td>
                <td className="px-4 py-3">{p.supplier?.name || '—'}</td>
                <td className="px-4 py-3">₦{p.unitPrice?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={p.quantity === 0 ? 'text-red-600 font-bold' : ''}>
                    {p.quantity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StockBadge status={getStatus(p)} />
                </td>
                <td className="px-4 py-3 space-x-2">
                  {canEdit && (
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  {hasRole('admin') && (
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input name="sku" value={form.sku} onChange={handleChange} required className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input name="category" value={form.category} onChange={handleChange} list="categories" className={inputCls} />
              <datalist id="categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supplier</label>
              <select name="supplier" value={form.supplier} onChange={handleChange} className={inputCls}>
                <option value="">None</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Stock</label>
              <input type="number" name="minStock" value={form.minStock} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price (₦)</label>
              <input type="number" name="unitPrice" value={form.unitPrice} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="2" className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
