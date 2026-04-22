import { useEffect, useRef, useState } from 'react';
import { Cpu, Zap, Terminal, Activity } from 'lucide-react';

interface HeroSectionProps {
  onStartChat: () => void;
}

export function HeroSection({ onStartChat }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Advanced tech animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation state
    let time = 0;
    const gridPoints: { x: number; y: number; z: number; baseX: number; baseY: number }[] = [];
    const dataStreams: { x: number; y: number; length: number; speed: number; char: string }[] = [];
    const scanLines: { y: number; opacity: number }[] = [];
    
    // Initialize 3D grid
    const gridCols = 20;
    const gridRows = 15;
    const perspective = 800;
    const centerX = canvas.width * 0.7;
    const centerY = canvas.height * 0.6;
    
    for (let i = 0; i <= gridCols; i++) {
      for (let j = 0; j <= gridRows; j++) {
        gridPoints.push({
          x: (i - gridCols / 2) * 60,
          y: (j - gridRows / 2) * 40,
          z: 0,
          baseX: i,
          baseY: j,
        });
      }
    }

    // Initialize data streams (Matrix-style falling characters)
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    for (let i = 0; i < 30; i++) {
      dataStreams.push({
        x: Math.random() * canvas.width * 0.3,
        y: Math.random() * canvas.height,
        length: 10 + Math.random() * 20,
        speed: 2 + Math.random() * 3,
        char: chars[Math.floor(Math.random() * chars.length)],
      });
    }

    // Initialize scan lines
    for (let i = 0; i < 5; i++) {
      scanLines.push({
        y: Math.random() * canvas.height,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }

    const project3D = (x: number, y: number, z: number) => {
      const scale = perspective / (perspective + z + 400);
      return {
        x: centerX + x * scale,
        y: centerY + y * scale,
        scale,
      };
    };

    const animate = () => {
      time += 0.016;
      
      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw 3D perspective grid
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.15)';
      ctx.lineWidth = 1;

      gridPoints.forEach((point) => {
        // Animate Z position with wave
        point.z = Math.sin(time * 2 + point.baseX * 0.3 + point.baseY * 0.2) * 50 +
                  Math.cos(time * 1.5 + point.baseX * 0.2) * 30;
      });

      // Draw horizontal grid lines
      for (let j = 0; j <= gridRows; j++) {
        ctx.beginPath();
        for (let i = 0; i <= gridCols; i++) {
          const idx = i * (gridRows + 1) + j;
          const point = gridPoints[idx];
          const projected = project3D(point.x, point.y, point.z);
          
          if (i === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical grid lines
      for (let i = 0; i <= gridCols; i++) {
        ctx.beginPath();
        for (let j = 0; j <= gridRows; j++) {
          const idx = i * (gridRows + 1) + j;
          const point = gridPoints[idx];
          const projected = project3D(point.x, point.y, point.z);
          
          if (j === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.stroke();
      }

      // Draw grid points with glow
      gridPoints.forEach((point, idx) => {
        if (idx % 3 === 0) { // Draw every 3rd point for performance
          const projected = project3D(point.x, point.y, point.z);
          const intensity = (point.z + 80) / 160;
          
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, 2 * projected.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + intensity * 0.4})`;
          ctx.fill();
        }
      });

      // Draw data streams (left side)
      ctx.font = '14px monospace';
      dataStreams.forEach((stream) => {
        stream.y += stream.speed;
        if (stream.y > canvas.height) {
          stream.y = -stream.length * 20;
          stream.x = Math.random() * canvas.width * 0.25;
        }

        // Draw stream trail
        for (let i = 0; i < stream.length; i++) {
          const y = stream.y - i * 15;
          if (y < 0) continue;
          
          const opacity = 1 - (i / stream.length);
          const char = chars[(Math.floor(time * 10) + i + stream.x) % chars.length];
          
          ctx.fillStyle = i === 0 
            ? 'rgba(255, 255, 255, 0.9)' 
            : `rgba(0, 255, 0, ${opacity * 0.6})`;
          ctx.fillText(char, stream.x, y);
        }
      });

      // Draw horizontal scan lines
      scanLines.forEach((line) => {
        line.y += 3;
        if (line.y > canvas.height) line.y = 0;
        
        const gradient = ctx.createLinearGradient(0, line.y - 20, 0, line.y + 20);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
        gradient.addColorStop(0.5, `rgba(255, 0, 0, ${line.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, line.y - 20, canvas.width, 40);
      });

      // Draw rotating geometric shapes (center-right)
      const shapeX = canvas.width * 0.75;
      const shapeY = canvas.height * 0.4;
      
      // Outer ring
      ctx.save();
      ctx.translate(shapeX, shapeY);
      ctx.rotate(time * 0.3);
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 80;
        const y = Math.sin(angle) * 80;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Inner rotating triangle
      ctx.save();
      ctx.translate(shapeX, shapeY);
      ctx.rotate(-time * 0.5);
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 40;
        const y = Math.sin(angle) * 40;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Center pulse
      const pulseSize = 5 + Math.sin(time * 3) * 3;
      ctx.beginPath();
      ctx.arc(shapeX, shapeY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fill();

      // Draw tech decorative lines
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      
      // Top-right corner lines
      ctx.beginPath();
      ctx.moveTo(canvas.width - 100, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, 100);
      ctx.stroke();

      // Bottom-left corner lines
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 100);
      ctx.lineTo(0, canvas.height);
      ctx.lineTo(100, canvas.height);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Top status bar */}
          <div 
            className={`flex items-center justify-between mb-12 transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-500 font-mono text-xs">SYSTEM ONLINE</span>
              </div>
              <div className="h-4 w-px bg-gray-800" />
              <span className="text-gray-600 font-mono text-xs">BUILD 2024.12.15</span>
            </div>
            <div className="flex items-center gap-4 text-gray-600 font-mono text-xs">
              <span>CPU: 98%</span>
              <span>MEM: 64TB</span>
              <span>NET: 10Gbps</span>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left column */}
            <div className="space-y-8">
              {/* Label */}
              <div 
                className={`flex items-center gap-4 transition-all duration-700 delay-100 ${
                  isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <div className="h-px w-12 bg-red-600" />
                <Terminal className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-mono text-sm tracking-widest">
                  SKILL v2.0
                </span>
              </div>

              {/* Main Title */}
              <div 
                className={`transition-all duration-700 delay-200 ${
                  isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <h1 className="text-8xl md:text-9xl font-bold leading-none tracking-tighter">
                  <span className="text-white">毛</span>
                  <span className="text-red-600">选</span>
                  <span className="text-white">机</span>
                </h1>
                <div className="flex items-center gap-4 mt-4">
                  <div className="h-1 w-32 bg-gradient-to-r from-red-600 to-transparent" />
                  <span className="text-gray-500 font-mono text-lg tracking-wider">
                    一种哲人王系统的Skill版本
                  </span>
                </div>
              </div>

              {/* Description */}
              <div 
                className={`space-y-4 transition-all duration-700 delay-300 ${
                  isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <div className="border-l-4 border-red-600 pl-6 py-2">
                  <p className="text-gray-400 font-mono text-sm leading-relaxed">
                    <span className="text-green-500">&gt;</span> 毛泽东方法论 · 调查研究 · 矛盾分析
                  </p>
                  <p className="text-gray-400 font-mono text-sm leading-relaxed">
                    <span className="text-green-500">&gt;</span> 持久战略 · 统一战线 · 实践认识论
                  </p>
                  <p className="text-gray-400 font-mono text-sm leading-relaxed">
                    <span className="text-green-500">&gt;</span> 基于《毛选》五卷及231篇原典构建
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div 
                className={`flex items-center gap-6 transition-all duration-700 delay-400 ${
                  isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <button 
                  onClick={onStartChat} 
                  className="group relative px-8 py-4 bg-red-600 text-white font-mono font-bold overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700" />
                  <span className="relative flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    启动对话
                  </span>
                </button>
                
                <div className="flex items-center gap-3 px-4 py-2 border border-gray-800">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-gray-500 font-mono text-xs">READY</span>
                </div>
              </div>
            </div>

            {/* Right column - Tech visualization */}
            <div className="hidden lg:block relative">
              {/* Decorative tech elements */}
              <div 
                className={`absolute top-0 right-0 transition-all duration-1000 delay-500 ${
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
              >
                <div className="relative w-64 h-64">
                  {/* Outer ring */}
                  <div className="absolute inset-0 border-2 border-red-600/20 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                  {/* Middle ring */}
                  <div className="absolute inset-4 border border-red-600/30 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                  {/* Inner ring */}
                  <div className="absolute inset-8 border-2 border-green-500/20 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-16 h-16 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Data readout panel */}
              <div 
                className={`absolute bottom-0 right-0 bg-black/80 border border-gray-800 p-4 transition-all duration-1000 delay-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between gap-8">
                    <span className="text-gray-600">NEURAL_NET</span>
                    <span className="text-green-500">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between gap-8">
                    <span className="text-gray-600">INFERENCE</span>
                    <span className="text-green-500">RUNNING</span>
                  </div>
                  <div className="flex items-center justify-between gap-8">
                    <span className="text-gray-600">LATENCY</span>
                    <span className="text-red-500">12ms</span>
                  </div>
                  <div className="h-px bg-gray-800 my-2" />
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-gray-800 overflow-hidden">
                      <div className="h-full w-3/4 bg-red-600 animate-pulse" />
                    </div>
                    <span className="text-gray-500">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className="h-full bg-gradient-to-r from-red-600 via-red-600/50 to-transparent" />
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-20 left-8 w-16 h-16 border-l-2 border-t-2 border-red-600/30" />
      <div className="absolute bottom-20 right-8 w-16 h-16 border-r-2 border-b-2 border-red-600/30" />
    </section>
  );
}
