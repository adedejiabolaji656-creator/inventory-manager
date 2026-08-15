import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

const types = ['stock-in', 'stock-out'];

export default function StockMoves() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState('stock-in');
  const [form, setForm] = useState({ productId: '', quantity: 1, reason: '', note: '', reference: '' });

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    const [mv, pr] = await Promise.all([api.get(`/stock?${params.toString()}`), api.get('/products')]);
    setMovements(mv.data);
    setProducts(pr.data);
  }, [typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('stock:update', () => {
      load();
      toast('Stock updated', { icon: '↔️' });
    });
    return () => socket.off('stock:update');
  }, [load]);

  const openModal = (t) => {
    setType(t);
    setForm({ productId: '', quantity: 1, reason: '', note: '', reference: '' });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/stock/${type}`, form);
      toast.success(type === 'stock-in' ? 'Stock added' : 'Stock removed');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const inputCls =
    'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock Movements</h1>
          <p className="text-slate-500 mt-1">Record stock-in and stock-out activity</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('stock-in')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            + Stock In
          </button>
          <button
            onClick={() => openModal('stock-out')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            − Stock Out
          </button>
        </div>
      </div>

      <div className="mb-6">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Movements</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Quantity</th>
              <th className="text-left px-4 py-3">Reason</th>
              <th className="text-left px-4 py-3">By</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m._id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      m.type === 'stock-in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {m.type}
                  </span>
                </td>
                <td className="px-4 py-3">{m.product?.name || '—'}</td>
                <td className="px-4 py-3 font-medium">{m.quantity}</td>
                <td className="px-4 py-3">{m.reason || '—'}</td>
                <td className="px-4 py-3">{m.createdBy?.name || '—'}</td>
                <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!movements.length && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No movements
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={type === 'stock-in' ? 'Stock In' : 'Stock Out'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product *</label>
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (in stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <input name="reason" value={form.reason} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input name="reference" value={form.reference} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows="2" className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              className={
                type === 'stock-in'
                  ? 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg'
                  : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg'
              }
            >
              {type === 'stock-in' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </form>
        {form.productId && (
          <p className="mt-2 text-xs text-slate-500">
            Logged in as: {user?.name}
          </p>
        )}
      </Modal>
    </div>
  );
}
