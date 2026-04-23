import { ParticleBackground } from './components/ParticleBackground';
import { Navigation } from './components/Navigation';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { ChatSection } from './sections/ChatSection';
import { ContactSection } from './sections/ContactSection';
import { useTheme } from './hooks/use-theme';

function App() {
  const { isDark, toggle } = useTheme();

  const scrollToChat = () => {
    const chatSection = document.getElementById('chat');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden theme-root">
      {/* Global Background */}
      <ParticleBackground />

      {/* Navigation */}
      <Navigation onStartChat={scrollToChat} isDark={isDark} onToggleTheme={toggle} />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection onStartChat={scrollToChat} />
        <AboutSection />
        <ChatSection />
        <ContactSection />
      </main>

      {/* Global Overlay Effects — dark mode only */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 0, 0.02) 2px,
                rgba(0, 255, 0, 0.02) 4px
              )`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(
                ellipse at center,
                transparent 0%,
                transparent 50%,
                rgba(0, 0, 0, 0.5) 100%
              )`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
