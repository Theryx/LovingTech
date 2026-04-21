'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const { language } = useLanguage();

  const messages = {
    en: { brand: 'Loving Tech', tagline: 'Premium Gadgets', loading: 'Loading product catalogue...' },
    fr: { brand: 'Loving Tech', tagline: 'Premium Gadgets', loading: 'Chargement du catalogue...' },
  };

  const msg = messages[language] || messages.en;

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2800);
    const hideTimer = setTimeout(() => setVisible(false), 3300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b]"
      style={{ transition: 'opacity 0.5s ease', opacity: fading ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full border-2 border-blue-500 opacity-30 animate-ping" />
          <div className="h-14 w-14 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold tracking-widest text-white uppercase">
            {msg.brand}
          </p>
          <p className="mt-1 text-xs tracking-widest text-zinc-500 uppercase">
            {msg.tagline}
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            {msg.loading}
          </p>
        </div>
      </div>
    </div>
  );
}
