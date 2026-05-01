import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { COMPANY } from '../lib/config';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#020618] text-white/80 pt-20 pb-10" data-testid="footer">
      <div className="gma-container grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Link to="/" className="inline-flex items-center mb-6" aria-label="PT. Geya Mora Agung">
            <div className="bg-white p-3 shadow-sm">
              <img
                src="/logo-gma.jpeg"
                alt="PT. Geya Mora Agung"
                className="h-14 md:h-16 w-auto object-contain"
              />
            </div>
          </Link>
          <p className="text-sm opacity-70 leading-relaxed max-w-md mb-6">{t('footer.tagline')}</p>
          <div className="flex flex-wrap gap-2">
            {[t('footer.nib'), t('footer.oss'), t('footer.apip'), t('footer.pmdn')].map((b, i) => (
              <span key={i} className="text-[10px] uppercase tracking-widest bg-white/10 px-3 py-1.5 font-semibold">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="text-[10px] uppercase tracking-widest mb-5 text-[hsl(var(--accent))] font-semibold">
            {t('footer.navTitle')}
          </div>
          <ul className="space-y-3 text-sm">
            <li><a href="/#about" className="hover:text-[hsl(var(--accent))] transition-colors">{t('nav.about')}</a></li>
            <li><a href="/#services" className="hover:text-[hsl(var(--accent))] transition-colors">{t('nav.services')}</a></li>
            <li><a href="/#sectors" className="hover:text-[hsl(var(--accent))] transition-colors">{t('nav.sectors')}</a></li>
            <li><Link to="/blog" className="hover:text-[hsl(var(--accent))] transition-colors">{t('nav.blog')}</Link></li>
            <li><a href="/#faq" className="hover:text-[hsl(var(--accent))] transition-colors">{t('nav.faq')}</a></li>
            <li><Link to="/admin/login" className="hover:text-[hsl(var(--accent))] transition-colors">{t('nav.admin')}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="text-[10px] uppercase tracking-widest mb-5 text-[hsl(var(--accent))] font-semibold">
            {t('footer.contactTitle')}
          </div>
          <ul className="space-y-3 text-sm">
            <li><a href={`tel:${COMPANY.phoneDigits}`} className="hover:text-[hsl(var(--accent))]">{COMPANY.phone}</a></li>
            <li><a href={`mailto:${COMPANY.email}`} className="hover:text-[hsl(var(--accent))]">{COMPANY.email}</a></li>
            <li className="opacity-75 leading-relaxed">{COMPANY.address}</li>
          </ul>
        </div>
      </div>

      <div className="gma-container mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs opacity-60">
        <div>© {new Date().getFullYear()} {COMPANY.name}. {t('footer.rights')}</div>
        <div className="font-mono">NIB {COMPANY.nib} · PMDN</div>
      </div>
    </footer>
  );
}
