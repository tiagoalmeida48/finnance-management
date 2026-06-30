import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  format?: (value: number) => string;
  durationMs?: number;
  className?: string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({
  value,
  format = (v) => String(Math.round(v)),
  durationMs = 800,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduce || from === to) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplay(from + (to - from) * easeOutCubic(progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, durationMs]);

  return <span className={className}>{format(display)}</span>;
}
