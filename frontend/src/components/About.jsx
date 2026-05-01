import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { IMAGES } from '../lib/config';

export default function About() {
  const { t } = useTranslation();
  const checks = t('about.checks', { returnObjects: true });

  return (
    <section className="gma-section" id="about">
      <div className="gma-container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <img
            src={IMAGES.aboutWarehouse}
            alt="GMA Warehouse"
            loading="lazy"
            className="w-full aspect-[4/5] object-cover"
          />
          <div className="absolute -bottom-6 -right-6 md:right-6 bg-[hsl(var(--accent))] text-white px-6 py-5 hidden md:block">
            <div className="font-display text-4xl font-semibold leading-none">2024</div>
            <div className="text-[11px] uppercase tracking-widest font-semibold mt-1.5">
              {t('about.yearFounded')}
            </div>
          </div>
          <div className="absolute top-6 left-6 bg-[hsl(var(--primary))]/95 text-white px-5 py-3 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-widest opacity-75">{t('about.nibLabel')}</div>
            <div className="font-mono text-sm font-semibold mt-0.5">0711240094152</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="gma-overline mb-4">{t('about.overline')}</div>
          <h2 className="gma-h2 mb-6">{t('about.title')}</h2>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-5">{t('about.p1')}</p>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-8">{t('about.p2')}</p>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 bg-[hsl(var(--accent))] text-white flex items-center justify-center flex-shrink-0">
                  <Check size={14} strokeWidth={3} />
                </span>
                {c}
              </div>
            ))}
          </div>

          <a href="#contact" className="gma-btn gma-btn-primary" data-testid="about-cta">
            {t('about.cta')} <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
