import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const useInkRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prevRipples) => [...prevRipples, newRipple]);
  }, []);

  const RippleEffect = () => (
    <>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={cn(
            "absolute rounded-full bg-foreground/10 pointer-events-none animate-ink-ripple",
            "dark:bg-foreground/20"
          )}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
          }}
          onAnimationEnd={() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id))}
        />
      ))}
    </>
  );

  return { addRipple, RippleEffect };
};
