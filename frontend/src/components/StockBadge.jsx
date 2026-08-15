import React from 'react';

const styles = {
  in_stock: 'bg-green-100 text-green-700',
  low: 'bg-yellow-100 text-yellow-700',
  out_of_stock: 'bg-red-100 text-red-700',
};

const labels = {
  in_stock: 'In Stock',
  low: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

export default function StockBadge({ status }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}
    >
      {labels[status] || status}
    </span>
  );
}
