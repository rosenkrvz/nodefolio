import { useState, useEffect } from 'react';

/**
 * Clean, lightweight hook to detect phone viewport (< 640px).
 * Allows tablet viewports (>= 640px, e.g. iPad portrait 768px/834px) to render the full spatial canvas.
 * Listens to window resize and media query changes and updates reactively.
 */
export function useIsMobile(breakpoint: number = 640): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();

    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    if (query.addEventListener) {
      query.addEventListener('change', update);
    } else {
      query.addListener(update);
    }

    window.addEventListener('resize', checkMobile);

    return () => {
      if (query.removeEventListener) {
        query.removeEventListener('change', update);
      } else {
        query.removeListener(update);
      }
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
