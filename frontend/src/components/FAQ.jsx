import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export default function FAQ() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true });

  return (
    <section className="gma-section" id="faq">
      <div className="gma-container grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="gma-overline mb-4">{t('faq.overline')}</div>
          <h2 className="gma-h2">{t('faq.title')}</h2>
        </div>
        <div className="lg:col-span-8">
          <Accordion type="single" collapsible className="border-t border-border">
            {items.map((it, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger className="py-6 text-left font-display text-lg md:text-xl font-semibold hover:text-[hsl(var(--accent))] hover:no-underline">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="text-[hsl(var(--muted-foreground))] leading-relaxed pb-6">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
