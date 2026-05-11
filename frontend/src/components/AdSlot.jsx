import { useEffect, useRef } from 'react';

// AdSense pub ID from env, fallback to GMA's publisher ID
const PUBLISHER = process.env.REACT_APP_ADSENSE_CLIENT || 'ca-pub-5616961797801657';

// Map slot names → real AdSense data-ad-slot IDs (fill in from AdSense dashboard)
const SLOT_IDS = {
  'top-leaderboard': '',
  'in-feed': '',
  'in-article': '',
  'sidebar-mpu': '',
  'below-article': '',
  'mobile-banner': '',
};

const FORMATS = {
  'top-leaderboard': { h: '90px', label: 'Leaderboard 728×90' },
  'in-feed':         { h: '140px', label: 'In-Feed Native' },
  'in-article':      { h: '280px', label: 'In-Article Responsive' },
  'sidebar-mpu':     { h: '250px', label: 'Sidebar 300×250' },
  'below-article':   { h: '90px', label: 'Below Article 728×90' },
  'mobile-banner':   { h: '100px', label: 'Mobile Banner 320×100' },
};

export default function AdSlot({ slot, className = '', mobileOnly = false, desktopOnly = false }) {
  const slotId = SLOT_IDS[slot] || '';
  const ref = useRef(null);
  const fmt = FORMATS[slot] || FORMATS['in-article'];

  useEffect(() => {
    if (!PUBLISHER || !slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, [slotId]);

  const visibility = mobileOnly ? 'block lg:hidden' : desktopOnly ? 'hidden lg:block' : '';

  if (PUBLISHER && slotId) {
    return (
      <div className={`my-8 text-center ${visibility} ${className}`} data-testid={`ad-${slot}`}>
        <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] opacity-60 mb-1">
          Advertisement
        </p>
        <ins
          ref={ref}
          className="adsbygoogle block"
          style={{ display: 'block', minHeight: fmt.h }}
          data-ad-client={PUBLISHER}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Dev placeholder — shown when no slot ID is configured
  return (
    <div className={`my-8 ${visibility} ${className}`} data-testid={`ad-placeholder-${slot}`}>
      <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] opacity-60 mb-1 text-center">
        Advertisement
      </p>
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.04)] text-center"
        style={{ minHeight: fmt.h }}
      >
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--accent))] opacity-70">{fmt.label}</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
            slot: <code className="font-mono">{slot}</code> · {PUBLISHER}
          </p>
        </div>
      </div>
    </div>
  );
}
