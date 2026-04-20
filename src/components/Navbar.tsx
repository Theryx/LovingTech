'use client';

import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface NavbarProps {
  showAll: boolean;
  onToggleShowAll: () => void;
}

export default function Navbar({ showAll, onToggleShowAll }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-xl border-b border-zinc-800">
      <div className="text-xl font-bold italic tracking-tighter">LOVING TECH</div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleShowAll}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            showAll 
              ? 'bg-white text-black' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
        >
          {showAll 
            ? t({ en: 'Featured', fr: 'En vedette' })
            : t({ en: 'See All', fr: 'Voir tout' })
          }
        </button>
        
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
          title={language === 'en' ? 'Switch to French' : 'Passer en anglais'}
        >
          <Globe className="w-5 h-5" />
          <span className="sr-only">{language === 'en' ? 'FR' : 'EN'}</span>
        </button>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
          title={theme === 'dark' ? 'Switch to light mode' : 'Passer en mode sombre'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
}