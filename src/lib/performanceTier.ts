/**
 * Lightweight, zero-dependency client performance capability detection.
 * Categorizes devices into 'high', 'balanced', or 'low' tiers to scale
 * visual loop frequencies, canvas point allocations, and audio concurrency
 * unobtrusively while preserving 100% of the visual identity and features.
 */

export type PerformanceTier = 'high' | 'balanced' | 'low';

let cachedTier: PerformanceTier | null = null;
const listeners = new Set<(tier: PerformanceTier) => void>();

export function getDevicePerformanceTier(): PerformanceTier {
  if (cachedTier) return cachedTier;
  if (typeof window === 'undefined') return 'high';

  try {
    // 1. Check user motion preferences first
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      cachedTier = 'low';
      return cachedTier;
    }

    // 2. Hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;

    // 3. Device memory hint (GB RAM) if available in Chromium
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

    // 4. Mobile / low-power detection
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth < 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

    if (cores <= 2 || memory <= 2) {
      cachedTier = 'low';
    } else if (isMobile || cores <= 4 || memory <= 4) {
      cachedTier = 'balanced';
    } else {
      cachedTier = 'high';
    }
  } catch {
    cachedTier = 'balanced';
  }

  return cachedTier;
}

export function subscribePerformanceTier(listener: (tier: PerformanceTier) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
