import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-slate-500 mb-6">Page not found</p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        Go to Dashboard
      </Link>
    </div>
  );
}
