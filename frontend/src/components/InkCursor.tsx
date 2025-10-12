import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export const InkCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const colors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)'];

  const updateCursorPosition = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: MouseEvent) => {
    const id = Date.now();
    const size = Math.random() * 10 + 10; // 10-20px burst
    const color = colors[Math.floor(Math.random() * colors.length)];
    setSplashes((prev) => [...prev, { id, x: e.clientX, y: e.clientY, size, color }]);

    // Remove splash after animation
    setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => s.id !== id));
    }, 700); // Matches ink-splash-spritesheet animation duration
  };

  useEffect(() => {
    document.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Smooth cursor movement (optional, but good for organic feel)
  useEffect(() => {
    const animate = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current!);
  }, [position]);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          // Thin brush stroke visual
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--ink)',
          mixBlendMode: 'multiply',
          filter: 'blur(1px)',
        }}
      >
        {/* Trailing watercolor spread */}
        <div
          className="absolute inset-0 -z-10 animate-watercolor-spread"
          style={{
            backgroundColor: 'var(--accent-1)', // Example color, could vary
            opacity: 0.2,
            filter: 'blur(4px)',
            transform: 'scale(0.8)',
          }}
        />
      </div>

      {/* Ink splashes on click */}
      {splashes.map((splash) => (
        <div
          key={splash.id}
          className="fixed pointer-events-none z-[9998] animate-watercolor-spread"
          style={{
            left: splash.x,
            top: splash.y,
            width: splash.size,
            height: splash.size,
            borderRadius: '50%',
            backgroundColor: splash.color,
            opacity: 0.6,
            transform: 'translate(-50%, -50%) scale(0.5)',
            filter: 'blur(2px)',
            animationDuration: '700ms',
          }}
        />
      ))}
    </>
  );
};
