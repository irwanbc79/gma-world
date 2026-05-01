import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Link2, Leaf, Zap, TrendingUp } from 'lucide-react';

const icons = [ShieldCheck, MapPin, Link2, Leaf, Zap, TrendingUp];

export default function WhyUs() {
  const { t } = useTranslation();
  const items = t('why.items', { returnObjects: true });

  return (
    <section className="gma-section bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay opacity-60" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="gma-container relative">
        <div className="mb-14 max-w-3xl">
          <div className="gma-overline mb-4">{t('why.overline')}</div>
          <h2 className="gma-h2">{t('why.title')}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-white/10">
          {items.map((it, i) => {
            const Icon = icons[i] || ShieldCheck;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="p-8 border-r border-b border-white/10 hover:bg-white/5 transition-colors"
                data-testid={`why-card-${i}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-xs opacity-50">— {String(i + 1).padStart(2, '0')}</span>
                  <Icon size={28} className="text-[hsl(var(--accent))]" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold leading-tight mb-3">{it.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{it.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
