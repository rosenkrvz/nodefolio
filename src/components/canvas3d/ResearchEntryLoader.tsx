import React, { useEffect, useState, useRef } from 'react';

interface ResearchEntryLoaderProps {
  isSceneReady: boolean;
  phaseTitle?: string;
  phaseNumeral?: string;
  minDurationMs?: number;
  error?: string | null;
  onRetry?: () => void;
  onAbort?: () => void;
  onTransitionComplete: () => void;
}

export const ResearchEntryLoader: React.FC<ResearchEntryLoaderProps> = ({
  isSceneReady,
  phaseTitle = 'Latent Manifold Learning',
  phaseNumeral = 'V',
  minDurationMs = 1200,
  error = null,
  onRetry,
  onAbort,
  onTransitionComplete,
}) => {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [timedOutError, setTimedOutError] = useState<string | null>(null);

  // Measure reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const effectiveMinDuration = prefersReducedMotion ? 300 : minDurationMs;

  // Trigger smooth cinematic entrance fade-in on mount
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setHasEntered(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Minimum presentation timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, effectiveMinDuration);

    return () => clearTimeout(timer);
  }, [effectiveMinDuration]);

  // Safety fallback timeout: if scene takes > 10s without ready or error, show retry card
  useEffect(() => {
    if (isSceneReady || error) return;
    const safetyTimer = setTimeout(() => {
      if (!isSceneReady) {
        setTimedOutError('Scene compilation took longer than expected.');
      }
    }, 10000);

    return () => clearTimeout(safetyTimer);
  }, [isSceneReady, error]);

  const onTransitionCompleteRef = useRef(onTransitionComplete);
  onTransitionCompleteRef.current = onTransitionComplete;

  // Trigger smooth fade-out when BOTH minimum duration has elapsed AND scene is ready
  useEffect(() => {
    if (minTimeElapsed && isSceneReady && !error && !timedOutError && !isFadingOut) {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        onTransitionCompleteRef.current?.();
      }, prefersReducedMotion ? 150 : 350);

      return () => clearTimeout(exitTimer);
    }
  }, [minTimeElapsed, isSceneReady, error, timedOutError, isFadingOut, prefersReducedMotion]);

  const activeError = error || timedOutError;

  return (
    <div
      aria-label="Initializing Research Environment"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#07090e] text-white select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
        !hasEntered
          ? 'opacity-0 scale-[1.015]'
          : isFadingOut
          ? 'opacity-0 pointer-events-none scale-[0.985] blur-[2px]'
          : 'opacity-100 pointer-events-auto scale-100 blur-none'
      }`}
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top, 24px))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
      }}
    >
      {/* Scoped CSS for user-provided Dominoes animation */}
      <style>{`
        .research-entry-spinner-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 80px;
        }

        .spinner {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          margin-left: -75px;
        }

        .spinner span {
          position: absolute;
          top: 50%;
          left: var(--left);
          width: 35px;
          height: 7px;
          background: #ffffff;
          animation: dominos 1s ease infinite;
          box-shadow: 2px 2px 3px 0px black;
        }

        .spinner span:nth-child(1) {
          --left: 80px;
          animation-delay: 0.125s;
        }

        .spinner span:nth-child(2) {
          --left: 70px;
          animation-delay: 0.3s;
        }

        .spinner span:nth-child(3) {
          left: 60px;
          animation-delay: 0.425s;
        }

        .spinner span:nth-child(4) {
          animation-delay: 0.54s;
          left: 50px;
        }

        .spinner span:nth-child(5) {
          animation-delay: 0.665s;
          left: 40px;
        }

        .spinner span:nth-child(6) {
          animation-delay: 0.79s;
          left: 30px;
        }

        .spinner span:nth-child(7) {
          animation-delay: 0.915s;
          left: 20px;
        }

        .spinner span:nth-child(8) {
          left: 10px;
        }

        @keyframes dominos {
          50% {
            opacity: 0.7;
          }

          75% {
            -webkit-transform: rotate(90deg);
            transform: rotate(90deg);
          }

          80% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .spinner span {
            animation: none !important;
            transform: rotate(0deg) !important;
            opacity: 0.9 !important;
          }
        }
      `}</style>

      {/* Ambient background atmosphere matching Research visual language */}
      <div
        className={`absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.08)_0%,transparent_65%)] transition-opacity duration-1000 ease-out ${
          hasEntered && !isFadingOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out ${
          hasEntered && !isFadingOut ? 'opacity-25' : 'opacity-0'
        }`}
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Telemetry Header */}
      <div
        className={`relative z-10 w-full max-w-4xl px-6 flex items-center justify-between transition-all duration-600 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
          hasEntered && !isFadingOut ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          <div className="flex flex-col">
            <span className="font-tech text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-semibold">
              COMPUTATIONAL RESEARCH RUNTIME // SEC-03
            </span>
            <span className="font-display text-xs text-zinc-200 font-medium">
              3D Interactive Research Environment
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>WEBGL 2.0 // HIGH PRECISION</span>
        </div>
      </div>

      {/* Center Stage: User-Provided Animation or Error Fallback */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-lg transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
          hasEntered && !isFadingOut ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
        {activeError ? (
          /* Error Fallback Card */
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-rose-500/30 shadow-2xl backdrop-blur-xl max-w-md w-full animate-fade-in">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
              !
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white tracking-wide uppercase">
              Research Environment Initialization Interrupted
            </h3>
            <p className="font-mono text-xs text-zinc-400 mt-2 leading-relaxed">
              The interactive 3D visualization could not be initialized.
            </p>
            {activeError && (
              <p className="font-mono text-[10px] text-rose-400/80 mt-1.5 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                {activeError}
              </p>
            )}

            <div className="flex items-center justify-center gap-3 mt-5">
              {onRetry && (
                <button
                  type="button"
                  onClick={() => {
                    setTimedOutError(null);
                    setMinTimeElapsed(false);
                    onRetry();
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-tech text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  RETRY INITIALIZATION
                </button>
              )}
              {onAbort && (
                <button
                  type="button"
                  onClick={onAbort}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 font-tech text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  RETURN TO PORTFOLIO
                </button>
              )}
            </div>
          </div>
        ) : (
          /* User-Provided Dominoes Animation Stage */
          <div className="flex flex-col items-center">
            <div className="research-entry-spinner-wrapper my-6">
              {/* EXACT USER-PROVIDED DOMINOES SPINNER HTML */}
              <div className="spinner">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            {/* Target Phase and Loading Status */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 font-tech text-[10px] tracking-[0.2em] uppercase font-bold">
                <span>TARGET // PHASE {phaseNumeral}</span>
              </div>

              <h2 className="font-display text-sm sm:text-base font-semibold text-white tracking-wider uppercase mt-1">
                {phaseTitle}
              </h2>

              <p className="font-mono text-[11px] text-zinc-400 tracking-wide flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span>INITIALIZING GEOMETRIES &bull; PREPARING SHADERS &bull; STABILIZING CAMERA</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Footer */}
      <div
        className={`relative z-10 w-full max-w-4xl px-6 flex items-center justify-between text-[10px] font-mono text-zinc-500 transition-all duration-600 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
          hasEntered && !isFadingOut ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>SPATIAL COMPUTATION</span>
          <span>&bull;</span>
          <span>THREE.JS ARCHITECTURE</span>
        </div>
        <div className="hidden sm:block text-right">
          <span>INTERACTIVE MANIFOLDS // AUTOGRAD // OPTIMIZATION</span>
        </div>
      </div>
    </div>
  );
};
