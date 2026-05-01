import React from 'react';
import Marquee from 'react-fast-marquee';

const items = [
  'Commodity Trading',
  'Shipbuilding Industry',
  'Warehousing & Logistics',
  'Building Construction',
  'Marine Equipment',
  'Import & Sourcing',
  'General Trading',
  'CPO & Agricultural',
  'Fleet Repair',
  'Belawan Port',
];

export default function Ticker() {
  return (
    <div className="relative bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-5 border-y border-[hsl(var(--accent))]/30 overflow-hidden" data-testid="ticker">
      <Marquee gradient={false} speed={55} pauseOnHover>
        {items.concat(items).map((it, i) => (
          <span key={i} className="flex items-center font-display text-lg md:text-xl font-semibold mx-8 whitespace-nowrap">
            {it}
            <span className="mx-8 text-[hsl(var(--accent))]">◆</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
