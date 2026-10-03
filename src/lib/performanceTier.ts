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
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;

    // 4. Mobile / low-power detection
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth < 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

    // 5. GPU renderer check
    let isDedicatedGpu = false;
    let isSoftwareGpu = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
          isDedicatedGpu = /rtx|gtx|geforce|radeon|apple m|quadro|titan|arc|adreno (6[5-9]|7[0-9]|8[0-9])/i.test(renderer);
          isSoftwareGpu = /swiftshader|llvmpipe|basic render|software|intel.*(hd 2000|hd 3000|hd 4000)/i.test(renderer);
        }
      }
    } catch {
      // Fallback
    }

    if (isSoftwareGpu || cores <= 2 || (typeof memory === 'number' && memory <= 2)) {
      cachedTier = 'low';
    } else if (
      isDedicatedGpu ||
      (cores >= 6 && !isMobile) ||
      (!isMobile && cores >= 4 && window.innerWidth >= 1024) ||
      (typeof memory === 'number' && memory >= 8)
    ) {
      cachedTier = 'high';
    } else {
      cachedTier = 'balanced';
    }
  } catch {
    cachedTier = 'high';
  }

  return cachedTier;
}

export function subscribePerformanceTier(listener: (tier: PerformanceTier) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
