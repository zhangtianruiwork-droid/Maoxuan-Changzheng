import { useEffect, useRef, useState } from 'react';
import { Brain, Database, Network, Zap } from 'lucide-react';

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const specs = [
    { icon: Brain, label: '心智模型', value: '12个', desc: '矛盾论·持久战·统一战线' },
    { icon: Database, label: '原典覆盖', value: '231篇', desc: '毛选五卷全文索引' },
    { icon: Network, label: '对话阶段', value: '5阶段', desc: '调查→矛盾→战略→追问→收尾' },
    { icon: Zap, label: '核心协议', value: '调查前置', desc: '没有调查就没有发言权' },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen flex items-center py-20 bg-black overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Diagonal red block */}
      <div 
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-red-600/10 to-transparent"
        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%, 0 100%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Section header */}
        <div 
          className={`flex items-center gap-6 mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="h-1 w-20 bg-red-600" />
          <div>
            <span className="text-green-500 font-mono text-sm block mb-1">SECTION 01</span>
            <h2 className="text-5xl md:text-6xl font-bold text-white">系统信息</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Description */}
          <div 
            className={`space-y-8 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="data-block">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-3 h-3 bg-red-600" />
                方法论内核
              </h3>
              <p className="text-gray-400 font-mono leading-relaxed mb-4">
                毛选长征机以《矛盾论》《实践论》《论持久战》为方法论基础，
                不给通用建议，先问情况，再找主要矛盾，最后给出方向性判断。
              </p>
              <p className="text-gray-400 font-mono leading-relaxed">
                它的核心原则只有一条：没有调查就没有发言权。
                每一次对话都从5个摸底问题开始，把你的情况搞实了才开口分析。
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                '调查前置协议：3-5个摸底问题优先',
                '矛盾重构框架：揭示真正的主要矛盾',
                '毛式苏格拉底连环追问：推动你想清楚',
                '5种错误模式识别：教条/冒险/投降/官僚/尾巴主义',
              ].map((feature, i) => (
                <div 
                  key={feature}
                  className="flex items-center gap-4"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-2 h-2 bg-red-600" />
                  <span className="text-gray-300 font-mono">{feature}</span>
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-green-500 font-mono text-sm">OK</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Specs grid */}
          <div 
            className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            {specs.map((spec, i) => (
              <div
                key={spec.label}
                className="relative p-6 border border-gray-800 bg-black/50 group hover:border-red-600/50 transition-colors"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600/50" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600/50" />
                
                <spec.icon className="w-8 h-8 text-red-600 mb-4" />
                <div className="text-gray-500 font-mono text-xs mb-1">{spec.label}</div>
                <div className="text-2xl font-bold text-white mb-1">{spec.value}</div>
                <div className="text-gray-600 font-mono text-xs">{spec.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom status bar */}
        <div 
          className={`mt-16 flex items-center justify-between py-4 border-t border-gray-800 transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-8 font-mono text-xs text-gray-500">
            <span>BUILD: 2026.04</span>
            <span>VERSION: 2.0.0</span>
            <span>BASE: 《毛泽东选集》五卷</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-mono text-xs text-green-500">OPERATIONAL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
