import { useState, useRef, useEffect } from 'react';
import { Send, Radio, CheckCircle } from 'lucide-react';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', message: '' });
      }, 3000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen flex items-center py-20 bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div 
          className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-600/5 to-transparent"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-6 md:px-12">
        {/* Header */}
        <div 
          className={`flex items-center gap-6 mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="h-1 w-20 bg-red-600" />
          <div>
            <span className="text-green-500 font-mono text-sm block mb-1">SECTION 03</span>
            <h2 className="text-5xl md:text-6xl font-bold text-white flex items-center gap-4">
              <Radio className="w-10 h-10 text-red-600" />
              数据链路
            </h2>
          </div>
        </div>

        {/* Form container */}
        <div 
          className={`border border-gray-800 bg-black/80 p-8 md:p-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {isSubmitted ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-mono">传输完成</h3>
              <p className="text-gray-500 font-mono">DATA TRANSMITTED SUCCESSFULLY</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name field */}
              <div className="relative">
                <label className="block text-gray-500 font-mono text-xs mb-2 uppercase tracking-wider">
                  标识符 / IDENTIFIER
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white font-mono focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="输入标识符..."
                  />
                  <div 
                    className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                      focusedField === 'name' ? 'w-full' : 'w-0'
                    }`} 
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="relative">
                <label className="block text-gray-500 font-mono text-xs mb-2 uppercase tracking-wider">
                  通信地址 / COMMS ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white font-mono focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="输入通信地址..."
                  />
                  <div 
                    className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                      focusedField === 'email' ? 'w-full' : 'w-0'
                    }`} 
                  />
                </div>
              </div>

              {/* Message field */}
              <div className="relative">
                <label className="block text-gray-500 font-mono text-xs mb-2 uppercase tracking-wider">
                  数据包 / DATA PACKET
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                    className="w-full bg-transparent border-b-2 border-gray-800 py-3 text-white font-mono focus:outline-none focus:border-red-600 transition-colors resize-none"
                    placeholder="输入数据内容..."
                  />
                  <div 
                    className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                      focusedField === 'message' ? 'w-full' : 'w-0'
                    }`} 
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="group relative w-full md:w-auto px-12 py-4 bg-red-600 text-white font-mono font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-3"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                  <Send className="w-5 h-5" />
                  传输数据
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div 
          className={`mt-12 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-8 font-mono text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>LINK ACTIVE</span>
            </div>
            <span>ENCRYPTION: AES-256</span>
            <span>PROTOCOL: HTTPS</span>
          </div>
          <div className="text-gray-600 font-mono text-xs">
            毛选长征机 © 2026
          </div>
        </div>
      </div>
    </section>
  );
}
