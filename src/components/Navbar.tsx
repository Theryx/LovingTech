'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-zinc-200 dark:bg-black/50 dark:border-zinc-800">
      <Link href="/" className="text-xl font-bold italic tracking-tighter text-zinc-900 dark:text-white">
        LOVING TECH
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition text-zinc-700 dark:text-white"
          title={language === 'en' ? 'Switch to French' : 'Passer en anglais'}
        >
          <Globe className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition text-zinc-700 dark:text-white"
          title={mounted ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : ''}
        >
          {mounted
            ? theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
            : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
}
