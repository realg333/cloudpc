'use client';

import { useEffect, useState } from 'react';

type PaymentAmbientIntensity = 'subtle' | 'medium';
type PaymentAmbientSection = 'checkout' | 'orders';

interface PaymentAmbientMotionProps {
  intensity?: PaymentAmbientIntensity;
  section?: PaymentAmbientSection;
  className?: string;
}

const opacityByIntensity: Record<PaymentAmbientIntensity, { slider: number; scroll: number }> = {
  subtle: { slider: 0.18, scroll: 0.12 },
  medium: { slider: 0.26, scroll: 0.2 },
};

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export default function PaymentAmbientMotion({
  intensity = 'subtle',
  section = 'checkout',
  className,
}: PaymentAmbientMotionProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreferenceChanged = () => setReducedMotion(mediaQuery.matches);

    onPreferenceChanged();
    mediaQuery.addEventListener('change', onPreferenceChanged);

    return () => {
      mediaQuery.removeEventListener('change', onPreferenceChanged);
    };
  }, []);

  if (reducedMotion) {
    return null;
  }

  const opacity = opacityByIntensity[intensity];

  return (
    <div
      aria-hidden="true"
      className={joinClassNames('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
      data-section={section}
      data-intensity={intensity}
    >
      <div className="ambient-slider-layer">
        <video
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          style={{ opacity: opacity.slider }}
        >
          <source src="/animations/slider-animation.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="ambient-scroll-layer">
        <video
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          style={{ opacity: opacity.scroll }}
        >
          <source src="/animations/website-scroll-animation.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
