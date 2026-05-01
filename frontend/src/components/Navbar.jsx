import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { FlagID, FlagEN } from './Flags';
import { COMPANY } from '../lib/config';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    window.localStorage.setItem('gma-lang', lng);
  };

  const isHome = location.pathname === '/';
  const navLinks = [
    { href: isHome ? '#about' : '/#about', label: t('nav.about') },
    { href: isHome ? '#services' : '/#services', label: t('nav.services') },
    { href: isHome ? '#sectors' : '/#sectors', label: t('nav.sectors') },
    { href: '/blog', label: t('nav.blog'), route: true },
    { href: isHome ? '#faq' : '/#faq', label: t('nav.faq') },
    { href: isHome ? '#contact' : '/#contact', label: t('nav.contact') },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-background/85 border-b border-border py-2'
          : 'bg-transparent py-4'
      }`}
      data-testid="navbar"
    >
      <div className="gma-container flex items-center justify-between">
        <Link
          to="/"
          data-testid="nav-logo"
          className="flex items-center gap-3"
          aria-label="PT. Geya Mora Agung"
        >
          <div className="bg-white px-2 py-1.5 shadow-sm border border-black/5 flex items-center justify-center h-10 md:h-11">
            <img
              src="/logo-gma.jpeg"
              alt="PT. Geya Mora Agung"
              className="h-full w-auto object-contain"
              style={{ maxWidth: '110px' }}
            />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) =>
            l.route ? (
              <NavLink
                key={l.href}
                to={l.href}
                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, '-')}`}
                className={({ isActive }) =>
                  `text-sm font-medium uppercase tracking-wider transition-colors hover:text-[hsl(var(--accent))] ${
                    isActive ? 'text-[hsl(var(--accent))]' : ''
                  }`
                }
              >
                {l.label}
              </NavLink>
            ) : (
              <a
                key={l.href}
                href={l.href}
                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm font-medium uppercase tracking-wider transition-colors hover:text-[hsl(var(--accent))]"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-[hsl(var(--surface-alt))] p-1">
            <button
              onClick={() => setLang('id')}
              data-testid="lang-switcher-id"
              aria-label="Bahasa Indonesia"
              className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold transition-all ${
                i18n.language === 'id'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <FlagID size={16} />
              <span>ID</span>
            </button>
            <button
              onClick={() => setLang('en')}
              data-testid="lang-switcher-en"
              aria-label="English"
              className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold transition-all ${
                i18n.language === 'en'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <FlagEN size={16} />
              <span>EN</span>
            </button>
          </div>

          <button
            onClick={toggle}
            data-testid="theme-toggle"
            aria-label="Toggle theme"
            className="p-2.5 hover:bg-[hsl(var(--surface-alt))] transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a
            href={`https://wa.me/${COMPANY.phoneDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-cta-whatsapp"
            className="hidden md:inline-flex gma-btn gma-btn-primary !py-3 !px-5 !text-xs"
          >
            WhatsApp
          </a>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2"
            aria-label="Menu"
            data-testid="nav-mobile-toggle"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="lg:hidden border-t border-border bg-background"
          data-testid="nav-mobile-menu"
        >
          <div className="gma-container py-6 flex flex-col gap-4">
            {navLinks.map((l) =>
              l.route ? (
                <Link key={l.href} to={l.href} className="text-sm uppercase tracking-wider font-medium">
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} className="text-sm uppercase tracking-wider font-medium">
                  {l.label}
                </a>
              )
            )}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button onClick={() => setLang('id')} className="flex items-center gap-2 text-sm">
                <FlagID size={18} /> ID
              </button>
              <button onClick={() => setLang('en')} className="flex items-center gap-2 text-sm">
                <FlagEN size={18} /> EN
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
