import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { COMPANY } from '../lib/config';
import { MessageSquare, Mail } from 'lucide-react';

export default function CTA() {
  const { t } = useTranslation();
  return (
    <section className="bg-[hsl(var(--primary))] text-white relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay opacity-70" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div className="gma-container py-20 md:py-28 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="gma-overline mb-6">▲ {t('cta.eyebrow')}</div>
          <h2 className="font-display text-5xl md:text-7xl font-semibold leading-none tracking-tight mb-8">
            {t('cta.title')}
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg opacity-80 mb-10 leading-relaxed">
            {t('cta.desc')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`https://wa.me/${COMPANY.phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gma-btn gma-btn-primary"
              data-testid="cta-whatsapp"
            >
              <MessageSquare size={16} /> WhatsApp
            </a>
            <a
              href={`mailto:${COMPANY.email}`}
              className="gma-btn bg-white text-[hsl(var(--primary))] hover:bg-gray-100"
              data-testid="cta-email"
            >
              <Mail size={16} /> Email
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
