import { useState, useEffect } from 'react';
import { Menu, X, Cpu, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  onStartChat: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navigation({ onStartChat, isDark, onToggleTheme }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`nav-bar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'nav-scrolled border-b border-red-600/30' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2 md:gap-3 group"
            >
              <div className="relative">
                <Cpu className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                <div className="absolute inset-0 w-5 h-5 md:w-6 md:h-6 bg-red-600/20 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-bold tracking-wider nav-text">毛选长征机</span>
                <span className="text-[9px] md:text-[10px] text-green-500 font-mono tracking-widest">SKILL v2.0</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'about', label: '系统信息' },
                { id: 'chat', label: '对话终端' },
                { id: 'contact', label: '数据链路' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="relative px-4 py-2 text-sm font-mono nav-link transition-colors group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300" />
                </button>
              ))}

              <div className="w-px h-6 bg-red-600/30 mx-3" />

              {/* Theme toggle */}
              <button
                onClick={onToggleTheme}
                className="p-2 nav-link transition-colors hover:text-red-500"
                title={isDark ? '开灯' : '关灯'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={onStartChat}
                className="ml-2 px-4 py-2 bg-red-600 text-white text-sm font-mono hover:bg-red-700 transition-colors"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
              >
                启动
              </button>
            </div>

            {/* Mobile right controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onToggleTheme}
                className="p-2 nav-text transition-colors"
                title={isDark ? '开灯' : '关灯'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 nav-text border border-red-600/50"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu-overlay fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-start justify-center h-full px-8 gap-6">
          {[
            { id: 'about', label: '系统信息', num: '01' },
            { id: 'chat', label: '对话终端', num: '02' },
            { id: 'contact', label: '数据链路', num: '03' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="flex items-center gap-4 text-2xl font-mono nav-text hover:text-red-600 transition-colors"
            >
              <span className="text-red-600 text-sm">{item.num}</span>
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onStartChat();
              setIsMobileMenuOpen(false);
            }}
            className="mt-8 px-8 py-3 bg-red-600 text-white font-mono text-lg"
          >
            启动系统
          </button>
        </div>
      </div>
    </>
  );
}
