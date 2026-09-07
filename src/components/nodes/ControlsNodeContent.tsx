import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Sliders, Cpu } from 'lucide-react';

interface ControlsNodeContentProps {
  initialData?: {
    model: string;
    samplingMethod: string;
    qualitySteps: number;
    promptStrength: number;
    randomness: number;
  };
  onUpdateParams?: (params: any) => void;
}

export const ControlsNodeContent: React.FC<ControlsNodeContentProps> = ({
  initialData,
  onUpdateParams,
}) => {
  const [model, setModel] = useState(initialData?.model || 'DreamShaper 8 (SDXL + VAE)');
  const [randomness, setRandomness] = useState(initialData?.randomness || 12345);
  const [controlMode, setControlMode] = useState('Production [Fixed]');
  const [qualitySteps, setQualitySteps] = useState(initialData?.qualitySteps || 30);
  const [promptStrength, setPromptStrength] = useState(initialData?.promptStrength || 8.0);
  const [samplingMethod, setSamplingMethod] = useState(initialData?.samplingMethod || 'dpm++ 2M Karras');

  const handleStepChange = (delta: number) => {
    const next = Math.max(10, Math.min(60, qualitySteps + delta));
    setQualitySteps(next);
    onUpdateParams?.({ qualitySteps: next });
  };

  return (
    <div className="space-y-2.5 pt-1 text-zinc-200">
      {/* Model Selector Bar */}
      <div className="space-y-1">
        <label className="text-xs font-body font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-rose-400" />
            <span>Target Runtime Engine</span>
          </span>
          <span className="text-emerald-400 text-xs font-body font-medium">Ready</span>
        </label>
        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:border-rose-500 focus:outline-none appearance-none cursor-pointer pr-8 font-body font-medium"
          >
            <option value="DreamShaper 8 (SDXL + VAE)">Architecture v3.2 (Production)</option>
            <option value="Gemini 2.5 Flash Live Pipeline">Gemini 2.5 Flash Live Pipeline</option>
            <option value="WebGL Shaders Low-Latency">WebGL Shaders Low-Latency</option>
            <option value="Kubernetes Zero-Downtime Mesh">Kubernetes Zero-Downtime Mesh</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Sliders and Control Mode */}
      <div className="space-y-2">
        {/* Randomness */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-xs font-body text-zinc-300 font-medium">Randomness</span>
          <div className="relative flex items-center">
            <input
              type="number"
              value={randomness}
              onChange={(e) => setRandomness(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs text-right rounded bg-black/40 border border-white/10 text-white focus:border-rose-400 focus:outline-none font-body font-medium"
            />
            <div className="absolute -left-12 -top-3 flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-body font-bold shadow-md shadow-rose-500/30 pointer-events-none z-10">
              <span>Kate</span>
              <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-rose-500 rotate-45 transform" />
            </div>
          </div>
        </div>

        {/* Control Mode */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-xs font-body text-zinc-300 font-medium">Control mode</span>
          <select
            value={controlMode}
            onChange={(e) => setControlMode(e.target.value)}
            className="w-28 px-2 py-1 text-xs text-right rounded bg-black/40 border border-white/10 text-white focus:border-rose-400 focus:outline-none font-body font-medium cursor-pointer"
          >
            <option value="Fixed">Fixed</option>
            <option value="Adaptive">Adaptive</option>
            <option value="Dynamic">Dynamic</option>
          </select>
        </div>

        {/* Quality Steps with < 30 > steppers */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-xs font-body text-zinc-300 font-medium">Quality steps</span>
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => handleStepChange(-5)}
              className="p-0.5 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-body font-bold text-white">
              {qualitySteps}
            </span>
            <button
              type="button"
              onClick={() => handleStepChange(5)}
              className="p-0.5 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Prompt Strength */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-xs font-body text-zinc-300 font-medium">Prompt strength</span>
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={promptStrength}
              onChange={(e) => setPromptStrength(parseFloat(e.target.value))}
              className="w-16 h-1 accent-rose-500 bg-white/10 rounded cursor-pointer"
            />
            <span className="w-8 text-right text-xs font-body font-semibold text-rose-300">
              {promptStrength.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Sampling Method */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-xs font-body text-zinc-300 font-medium">Sampling method</span>
          <select
            value={samplingMethod}
            onChange={(e) => setSamplingMethod(e.target.value)}
            className="w-32 px-2 py-1 text-xs text-right rounded bg-black/40 border border-white/10 text-white focus:border-rose-400 focus:outline-none font-body font-medium cursor-pointer"
          >
            <option value="dpm++ 2M Karras">dpm++ 2M Karras</option>
            <option value="Euler Ancestral">Euler Ancestral</option>
            <option value="DDIM Uniform">DDIM Uniform</option>
          </select>
        </div>
      </div>
    </div>
  );
};
