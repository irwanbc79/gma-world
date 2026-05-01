import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach token from localStorage (fallback when cookies blocked cross-domain)
api.interceptors.request.use((cfg) => {
  const t = typeof window !== 'undefined' ? window.localStorage.getItem('gma-token') : null;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const IMAGES = {
  heroPort:
    'https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&w=1600&q=80',
  heroPortAlt:
    'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=1600&q=80',
  aboutWarehouse:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  cpo:
    'https://images.unsplash.com/photo-1615484477201-9f4953340fab?auto=format&fit=crop&w=1200&q=80',
  shipyard:
    'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?auto=format&fit=crop&w=1200&q=80',
  warehouse:
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
  construction:
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
  container:
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80',
  garment:
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
  team:
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  logistics:
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
};

export const COMPANY = {
  name: 'PT. Geya Mora Agung',
  short: 'GMA',
  phone: '+62 812-6067-2072',
  phoneDigits: '6281260672072',
  email: 'gmamedan.2024@gmail.com',
  address: 'Jl. Bambu No. 18H, Gaharu, Medan Timur 20235',
  nib: '0711240094152',
  mapEmbedSrc:
    'https://www.google.com/maps?q=Jl.%20Bambu%20No.%2018H%2C%20Gaharu%2C%20Medan%20Timur%2020235&output=embed',
  mapsLink:
    'https://www.google.com/maps/search/?api=1&query=Jl.+Bambu+No.+18H,+Gaharu,+Medan+Timur+20235',
};
