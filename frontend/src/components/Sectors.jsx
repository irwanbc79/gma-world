import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { IMAGES } from '../lib/config';

const sectorImages = [IMAGES.shipyard, IMAGES.cpo, IMAGES.warehouse, IMAGES.construction, IMAGES.garment];
const spans = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
];

export default function Sectors() {
  const { t } = useTranslation();
  const items = t('sectors.items', { returnObjects: true });

  return (
    <section className="gma-section" id="sectors">
      <div className="gma-container">
        <div className="mb-12 max-w-3xl">
          <div className="gma-overline mb-4">{t('sectors.overline')}</div>
          <h2 className="gma-h2">{t('sectors.title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-5 md:h-[640px]">
          {items.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`relative overflow-hidden group cursor-pointer ${spans[i]} h-[320px] md:h-auto`}
              data-testid={`sector-card-${i}`}
            >
              <img
                src={sectorImages[i]}
                alt={s.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))]/95 via-[hsl(var(--primary))]/30 to-transparent" />
              <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-end text-white">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] mb-2">
                  {s.cat}
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold leading-tight mb-1">
                  {s.title}
                </h3>
                <p className="text-sm opacity-80">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
