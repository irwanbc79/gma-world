import React from 'react';

export const FlagID = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    className={className}
    aria-label="Bendera Indonesia"
  >
    <defs>
      <clipPath id="cp-id"><circle cx="10" cy="10" r="10" /></clipPath>
    </defs>
    <g clipPath="url(#cp-id)">
      <rect x="0" y="0" width="20" height="10" fill="#E70011" />
      <rect x="0" y="10" width="20" height="10" fill="#FFFFFF" />
    </g>
    <circle cx="10" cy="10" r="9.5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
  </svg>
);

export const FlagEN = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    className={className}
    aria-label="UK Flag"
  >
    <defs>
      <clipPath id="cp-en"><circle cx="10" cy="10" r="10" /></clipPath>
    </defs>
    <g clipPath="url(#cp-en)">
      <rect width="20" height="20" fill="#012169" />
      <path d="M0 0 L20 20 M20 0 L0 20" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M0 0 L20 20 M20 0 L0 20" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M10 0 V20 M0 10 H20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M10 0 V20 M0 10 H20" stroke="#C8102E" strokeWidth="2" />
    </g>
    <circle cx="10" cy="10" r="9.5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
  </svg>
);
