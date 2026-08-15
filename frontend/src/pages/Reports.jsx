import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const downloadCSV = (rows, filename) => {
  if (!rows.length) {
    toast.error('No data to export');
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded`);
};

export default function Reports() {
  const [exporting, setExporting] = useState('');

  const runExport = async (type) => {
    setExporting(type);
    try {
      if (type === 'products') {
        const { data } = await api.get('/products');
        downloadCSV(
          data.map((p) => ({
            Name: p.name,
            SKU: p.sku,
            Category: p.category,
            Quantity: p.quantity,
            MinStock: p.minStock,
            UnitPrice: p.unitPrice,
            Supplier: p.supplier?.name || '',
            Status: p.quantity <= 0 ? 'Out of Stock' : p.quantity <= p.minStock ? 'Low' : 'In Stock',
          })),
          'products-report.csv'
        );
      } else if (type === 'suppliers') {
        const { data } = await api.get('/suppliers');
        downloadCSV(
          data.map((s) => ({
            Name: s.name,
            Contact: s.contactPerson,
            Email: s.email,
            Phone: s.phone,
            Address: s.address,
          })),
          'suppliers-report.csv'
        );
      } else if (type === 'sales') {
        const { data } = await api.get('/sales');
        downloadCSV(
          data.map((s) => ({
            Invoice: s.invoiceNo,
            Customer: s.customerName || 'Walk-in',
            PaymentMethod: s.paymentMethod,
            TotalAmount: s.totalAmount,
            Date: new Date(s.createdAt).toLocaleString(),
            Items: s.items.map((i) => `${i.productName} x${i.quantity}`).join('; '),
          })),
          'sales-report.csv'
        );
      } else if (type === 'stock') {
        const { data } = await api.get('/stock');
        downloadCSV(
          data.map((m) => ({
            Type: m.type,
            Product: m.product?.name || '',
            Quantity: m.quantity,
            Reason: m.reason,
            Reference: m.reference,
            By: m.createdBy?.name || '',
            Date: new Date(m.createdAt).toLocaleString(),
          })),
          'stock-movements-report.csv'
        );
      }
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting('');
    }
  };

  const reports = [
    { type: 'products', title: 'Products Report', desc: 'All products with stock levels and status', icon: '📦' },
    { type: 'stock', title: 'Stock Movements', desc: 'All stock-in / stock-out history', icon: '↔️' },
    { type: 'suppliers', title: 'Suppliers Report', desc: 'All supplier contact information', icon: '🏢' },
    { type: 'sales', title: 'Sales Report', desc: 'All recorded sales transactions', icon: '💰' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Export Reports</h1>
      <p className="text-slate-500 mb-6">Download data as CSV spreadsheets</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.type} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{r.icon}</div>
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-sm text-slate-500">{r.desc}</p>
              </div>
            </div>
            <button
              onClick={() => runExport(r.type)}
              disabled={exporting === r.type}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {exporting === r.type ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold mb-2">Export with Date Range</h3>
        <p className="text-sm text-slate-500 mb-4">
          Export sales within a date range using the date filter on the Sales page, then export the CSV.
          This tool exports current full datasets.
        </p>
      </div>
    </div>
  );
}
