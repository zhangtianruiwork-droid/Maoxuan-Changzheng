import { useEffect, useRef } from 'react';

interface Line {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<Line[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize geometric lines
    const lineCount = 30;
    linesRef.current = Array.from({ length: lineCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: 50 + Math.random() * 150,
      angle: Math.random() > 0.5 ? 0 : Math.PI / 2,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.05 + Math.random() * 0.15,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lines = linesRef.current;

      lines.forEach((line) => {
        if (line.angle === 0) {
          line.x += line.speed;
          if (line.x > canvas.width + line.length) line.x = -line.length;
        } else {
          line.y += line.speed;
          if (line.y > canvas.height + line.length) line.y = -line.length;
        }

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 0, 0, ${line.opacity})`;
        ctx.lineWidth = 1;
        
        if (line.angle === 0) {
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + line.length, line.y);
        } else {
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x, line.y + line.length);
        }
        ctx.stroke();
      });

      if (Math.random() < 0.02) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + 100, startY + 100);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
