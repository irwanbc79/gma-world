import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Package, Anchor, Warehouse, Building2, Ship, Shirt, Handshake, Globe2 } from 'lucide-react';

const icons = [Package, Anchor, Warehouse, Building2, Ship, Shirt, Handshake, Globe2];

export default function Services() {
  const { t } = useTranslation();
  const items = t('services.items', { returnObjects: true });

  return (
    <section className="gma-section bg-[hsl(var(--surface))] relative" id="services">
      <div className="absolute inset-0 noise-overlay" />
      <div className="gma-container relative">
        <div className="grid lg:grid-cols-12 gap-8 mb-14">
          <div className="lg:col-span-6">
            <div className="gma-overline mb-4">{t('services.overline')}</div>
            <h2 className="gma-h2">{t('services.title')}</h2>
          </div>
          <div className="lg:col-span-6 lg:pt-14">
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{t('services.desc')}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-border">
          {items.map((item, i) => {
            const Icon = icons[i] || Package;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                className="group relative p-7 md:p-8 border-r border-b border-border bg-background hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all duration-500"
                data-testid={`service-card-${i}`}
              >
                <div className="flex items-start justify-between mb-10">
                  <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] group-hover:text-white/50">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Icon size={28} className="text-[hsl(var(--accent))]" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-semibold leading-tight mb-3 min-h-[52px]">
                  {item.name}
                </h3>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] mb-3">
                  {item.kbli}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-white/70 leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
