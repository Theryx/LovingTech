'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2300);
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
            Loving Tech
          </p>
          <p className="mt-1 text-xs tracking-widest text-zinc-500 uppercase">
            Premium Gadgets
          </p>
        </div>
      </div>
    </div>
  );
}
