import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StockBadge from '../components/StockBadge';

const PIE_COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [s, c] = await Promise.all([api.get('/dashboard'), api.get('/dashboard/charts')]);
      setStats(s.data);
      setCharts(c.data);
    };
    load();
  }, []);

  const pieData = stats
    ? [
        { name: 'In Stock', value: stats.stockDistribution.in_stock.count },
        { name: 'Low Stock', value: stats.stockDistribution.low.count },
        { name: 'Out of Stock', value: stats.stockDistribution.out_of_stock.count },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your inventory and sales performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8" style={{ gridAutoRows: '1fr' }}>
        <StatCard title="Total Products" value={stats?.totalProducts || 0} icon="📦" color="bg-blue-500" />
        <StatCard title="Total Suppliers" value={stats?.totalSuppliers || 0} icon="🏢" color="bg-indigo-500" />
        <StatCard title="Total Sales" value={stats?.totalSales || 0} icon="🧾" color="bg-purple-500" />
        <StatCard title="Revenue" value={`₦${stats?.totalRevenue?.toLocaleString() || 0}`} icon="💰" color="bg-green-500" />
        <StatCard title="Low Stock" value={stats?.lowStock || 0} icon="⚠️" color="bg-yellow-500" />
      </div>

      {stats && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold mb-4 text-slate-800">Daily Sales (7 days)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={charts?.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#2563eb" name="Revenue" />
                <Line type="monotone" dataKey="count" stroke="#10b981" name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold mb-4 text-slate-800">Stock Status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold mb-4 text-slate-800">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts?.topProducts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSold" fill="#2563eb" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold mb-4 text-slate-800">Low Stock Alerts</h2>
          {stats?.lowStockProducts?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Product</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Min</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((p) => (
                  <tr key={p._id} className="border-b last:border-0">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.quantity}</td>
                    <td className="py-2">{p.minStock}</td>
                    <td className="py-2">
                      <StockBadge
                        status={p.quantity <= 0 ? 'out_of_stock' : 'low'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-center py-8">No low stock items 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}
