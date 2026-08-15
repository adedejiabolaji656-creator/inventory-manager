import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { getSocket } from '../services/socket';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');

  const load = useCallback(async () => {
    const { data } = await api.get('/sales');
    setSales(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('sale:update', () => {
      load();
      toast('New sale recorded', { icon: '💰' });
    });
    return () => socket.off('sale:update');
  }, [load]);

  const openModal = async () => {
    const { data } = await api.get('/products');
    setProducts(data.filter((p) => p.quantity > 0));
    setCart([]);
    setCustomerName('');
    setPaymentMethod('cash');
    setModalOpen(true);
  };

  const addToCart = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(i.quantity + 1, product.quantity) } : i
        );
      }
      return [...prev, { productId, name: product.name, unitPrice: product.unitPrice, quantity: 1, max: product.quantity }];
    });
  };

  const updateQty = (productId, qty) => {
    const product = products.find((p) => p._id === productId);
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(Number(qty), product.quantity)) }
          : i
      )
    );
  };

  const removeItem = (productId) => setCart((prev) => prev.filter((i) => i.productId !== productId));

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) return toast.error('Add items to cart');
    try {
      await api.post('/sales', {
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
        customerName,
        paymentMethod,
      });
      toast.success('Sale recorded!');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    }
  };

  const inputCls =
    'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Records</h1>
          <p className="text-slate-500 mt-1">View and record sales transactions</p>
        </div>
        <button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + Record Sale
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Invoice</th>
              <th className="text-left px-4 py-3">Items</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{s.invoiceNo}</td>
                <td className="px-4 py-3">
                  {s.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')}
                </td>
                <td className="px-4 py-3">{s.customerName || 'Walk-in'}</td>
                <td className="px-4 py-3 capitalize">{s.paymentMethod}</td>
                <td className="px-4 py-3 font-medium">₦{s.totalAmount?.toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!sales.length && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No sales recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Sale">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Add Products</label>
            <div className="flex gap-2 flex-wrap">
              <select
                className={inputCls + ' flex-1'}
                value={selectedProduct}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    addToCart(val);
                    setSelectedProduct('');
                  }
                }}
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — ₦{p.unitPrice} (stock: {p.quantity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border rounded-lg divide-y">
              {cart.map((i) => (
                <div key={i.productId} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <div className="font-medium text-sm">{i.name}</div>
                    <div className="text-xs text-slate-500">₦{i.unitPrice} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={i.max}
                      value={i.quantity}
                      onChange={(e) => updateQty(i.productId, e.target.value)}
                      className="w-16 border rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm font-medium w-16 text-right">
                      ₦{(i.unitPrice * i.quantity).toLocaleString()}
                    </span>
                    <button type="button" onClick={() => removeItem(i.productId)} className="text-red-600">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between p-3 font-bold">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Complete Sale
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
