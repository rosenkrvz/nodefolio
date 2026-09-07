import React from 'react';
import { Pin } from '../types';

interface PinPortProps {
  pin: Pin;
  isConnected?: boolean;
  isActive?: boolean;
  onStartDragWire?: (pin: Pin, e: React.MouseEvent) => void;
  onEndDragWire?: (pin: Pin) => void;
}

const PIN_COLOR_MAP: Record<string, { bg: string; border: string; glow: string }> = {
  crimson: { bg: 'bg-rose-600', border: 'border-rose-500', glow: 'shadow-[0_0_8px_rgba(225,29,72,0.6)]' },
  red: { bg: 'bg-rose-600', border: 'border-rose-500', glow: 'shadow-[0_0_8px_rgba(225,29,72,0.6)]' },
  white: { bg: 'bg-zinc-200', border: 'border-zinc-300', glow: 'shadow-[0_0_8px_rgba(255,255,255,0.4)]' },
  yellow: { bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
  amber: { bg: 'bg-amber-600', border: 'border-amber-500', glow: 'shadow-[0_0_8px_rgba(217,119,6,0.5)]' },
  green: { bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
  cyan: { bg: 'bg-cyan-500', border: 'border-cyan-400', glow: 'shadow-[0_0_8px_rgba(6,182,212,0.5)]' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-400', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
  purple: { bg: 'bg-purple-500', border: 'border-purple-400', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]' },
};

export const PinPort: React.FC<PinPortProps> = ({
  pin,
  isConnected = false,
  isActive = false,
  onStartDragWire,
  onEndDragWire,
}) => {
  const colors = PIN_COLOR_MAP[pin.color] || PIN_COLOR_MAP.crimson;
  const isInput = pin.type === 'input';

  return (
    <div
      id={`pin-${pin.id}`}
      onMouseUp={() => onEndDragWire && onEndDragWire(pin)}
      className={`group flex items-center gap-2 py-0.5 select-none transition-colors cursor-pointer ${
        isInput ? 'flex-row' : 'flex-row-reverse text-right'
      }`}
    >
      {/* Physical Pin Dot with Interactive Dragging */}
      <div
        className="relative flex items-center justify-center p-1"
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartDragWire && onStartDragWire(pin, e);
        }}
      >
        <div
          className={`w-3 h-3 rounded-full border transition-all duration-200 cursor-crosshair ${colors.bg} ${colors.border} ${
            isConnected ? colors.glow : 'opacity-50 hover:opacity-100'
          } ${isActive ? 'scale-125 ring-2 ring-rose-400/50' : 'hover:scale-125'}`}
          title={`${pin.label} (${pin.type}) - Drag to connect`}
        />
        <div className="absolute w-1 h-1 rounded-full bg-black/80 pointer-events-none" />
      </div>

      {/* Label Text */}
      <span className="text-[11px] font-body font-medium text-zinc-300 group-hover:text-white transition-colors tracking-normal pointer-events-none">
        {pin.label}
      </span>
    </div>
  );
};
