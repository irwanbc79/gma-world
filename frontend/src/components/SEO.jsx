import React from 'react';
import { Helmet } from 'react-helmet-async';
import { COMPANY } from '../lib/config';

export default function SEO({ title, description, image, type = 'website', lang = 'id' }) {
  const fullTitle = title ? `${title} · ${COMPANY.name}` : `${COMPANY.name} — Integrated Trading, Maritime & Construction`;
  const desc =
    description ||
    'PT. Geya Mora Agung — Mitra terpercaya perdagangan besar, maritim, pergudangan & konstruksi di Medan, Sumatera Utara.';
  const img = image || (typeof window !== 'undefined' ? `${window.location.origin}/logo-gma.jpeg` : '/logo-gma.jpeg');

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY.name,
    alternateName: 'GMA',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://geyamoraagung.co.id',
    logo: typeof window !== 'undefined' ? `${window.location.origin}/logo-gma.jpeg` : '/logo-gma.jpeg',
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Bambu No. 18H',
      addressLocality: 'Medan Timur',
      addressRegion: 'Sumatera Utara',
      postalCode: '20235',
      addressCountry: 'ID',
    },
    sameAs: [],
  };

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'id_ID'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      <meta name="theme-color" content="#0A1128" />
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
    </Helmet>
  );
}
