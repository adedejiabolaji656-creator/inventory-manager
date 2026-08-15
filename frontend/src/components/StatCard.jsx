import React from 'react';

const iconRing = {
  'bg-blue-500': { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  'bg-indigo-500': { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
  'bg-purple-500': { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
  'bg-green-500': { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-100' },
  'bg-yellow-500': { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-100' },
  'bg-red-500': { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
};

export default function StatCard({ title, value, icon, color = 'bg-blue-500' }) {
  const scheme = iconRing[color] || iconRing['bg-blue-500'];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={`${scheme.bg} ${scheme.text} ${scheme.ring} ring-1 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-bold text-slate-900 truncate">{value}</div>
      </div>
    </div>
  );
}
