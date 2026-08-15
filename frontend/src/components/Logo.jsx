import React from 'react';

export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoBox" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="logoLid" x1="0" y1="0" x2="64" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      <rect x="4" y="24" width="56" height="36" rx="5" fill="url(#logoBox)" />

      <rect
        x="4"
        y="24"
        width="56"
        height="36"
        rx="5"
        fill="rgba(255,255,255,0.12)"
        style={{ mixBlendMode: 'overlay' }}
      />

      <rect x="2" y="8" width="60" height="18" rx="5" fill="url(#logoLid)" />
      <rect
        x="2"
        y="8"
        width="60"
        height="18"
        rx="5"
        fill="rgba(255,255,255,0.14)"
        style={{ mixBlendMode: 'overlay' }}
      />

      <path
        d="M26 50h12a2 2 0 0 1 2 2H24a2 2 0 0 1 2-2Z"
        fill="rgba(0,0,0,0.25)"
      />
      <rect x="22" y="42" width="20" height="5" rx="2" fill="rgba(0,0,0,0.22)" />

      <rect x="24" y="18" width="16" height="6" rx="2" fill="#93c5fd" />
      <circle cx="32" cy="30" r="3" fill="#dbeafe" opacity="0.95" />
    </svg>
  );
}
