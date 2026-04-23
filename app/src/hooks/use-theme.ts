import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('maoxuan_theme') as Theme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try { localStorage.setItem('maoxuan_theme', theme); } catch {}
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return { theme, isDark: theme === 'dark', toggle };
}
