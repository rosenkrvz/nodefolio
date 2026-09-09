import React, { useState, useEffect } from 'react';
import { VisitorNodeData, NodeData } from '../../types';
import { Close, Plus, Check } from '../icons';
import { playSound } from '../../lib/sound';

interface AddVisitorNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: NodeData) => void;
  existingVisitorCount: number;
  currentTransform?: { x: number; y: number; scale: number };
}

export const AddVisitorNodeModal: React.FC<AddVisitorNodeModalProps> = ({
  isOpen,
  onClose,
  onAddNode,
  existingVisitorCount,
  currentTransform,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'note' | 'idea' | 'question' | 'observation'>('note');
  const [shape, setShape] = useState<'square' | 'capsule' | 'sticky'>('sticky');
  const [accent, setAccent] = useState<'crimson' | 'white' | 'zinc'>('crimson');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Strict sanitization helper
  const sanitize = (text: string) => {
    return text.replace(/<[^>]*>?/gm, '').trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitize(name);
    const cleanMsg = sanitize(message);

    if (!cleanName || cleanName.length < 2) {
      setError('Please provide a name or pseudonym (at least 2 characters).');
      return;
    }
    if (!cleanMsg || cleanMsg.length < 4) {
      setError('Please provide a meaningful note or observation (at least 4 characters).');
      return;
    }

    // Determine collision-safe spatial placement right inside the user's current viewport
    const targetW = shape === 'capsule' ? 240 : 270;
    const targetH = 220;

    let spawnX: number;
    let spawnY: number;

    if (currentTransform && typeof window !== 'undefined') {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = currentTransform.scale || 0.6;
      // Calculate screen center in canvas coordinate space
      const centerCanvasX = (vw / 2 - currentTransform.x) / s - targetW / 2;
      const centerCanvasY = (vh / 2 - currentTransform.y) / s - targetH / 2;

      // Small organic stagger so multiple notes don't stack directly on top of each other
      const staggerX = (existingVisitorCount % 3) * 36 - 36 + (Math.random() * 20 - 10);
      const staggerY = Math.floor((existingVisitorCount % 6) / 3) * 36 - 18 + (Math.random() * 20 - 10);

      spawnX = Math.round(Math.max(100, Math.min(4100, centerCanvasX + staggerX)));
      spawnY = Math.round(Math.max(100, Math.min(4100, centerCanvasY + staggerY)));
    } else {
      // Fallback: place gracefully right next to the active research cluster
      const col = existingVisitorCount % 2;
      const row = Math.floor(existingVisitorCount / 2);
      spawnX = 1450 + col * 290 + (Math.random() * 20 - 10);
      spawnY = 450 + row * 240 + (Math.random() * 20 - 10);
    }

    const visitorPayload: VisitorNodeData = {
      id: `visitor-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName.slice(0, 30),
      message: cleanMsg.slice(0, 140),
      category,
      shape,
      accent,
      createdAt: Date.now(),
      approved: true,
    };

    const newNode: NodeData = {
      id: visitorPayload.id,
      title: `${cleanName.slice(0, 20)}'s Note`,
      subtitle: category.toUpperCase(),
      category: 'visitor',
      shape,
      x: Math.round(spawnX),
      y: Math.round(spawnY),
      width: shape === 'capsule' ? 240 : 270,
      inputs: [],
      outputs: [],
      accentColor: accent === 'crimson' ? '#f43f5e' : accent === 'white' ? '#ffffff' : '#71717a',
      glowColor: accent === 'crimson' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      visitorData: visitorPayload,
    };

    playSound('click');
    onAddNode(newNode);
    setName('');
    setMessage('');
    setError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create and place a research note on the computational graph"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150"
    >
      <div className="absolute inset-0 bg-[#090b10]/85 backdrop-blur-md" onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0c0e14] border-t sm:border border-white/[0.14] shadow-2xl p-5 sm:p-6 z-10 font-body text-zinc-200 max-h-[92vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+20px)] sm:pb-6 animate-in slide-in-from-bottom-3 sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto -mt-1 mb-4 shrink-0" />

        {/* Header reticle */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-tech text-xs font-bold text-rose-400 uppercase tracking-widest">
              WORKSPACE SYNTHESIZER // ADD NODE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add node modal"
            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl sm:rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <Close className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block font-tech text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
              YOUR NAME / CODENAME <span className="text-zinc-600">(MAX 30 CHARS)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="e.g. Elena V. / Research Visitor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] focus:border-rose-500 focus:outline-none text-xs text-white placeholder-zinc-500 transition-colors"
              maxLength={30}
              required
            />
          </div>

          {/* Note / Message Field */}
          <div>
            <label className="block font-tech text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
              NOTE CONTENT / THOUGHT <span className="text-zinc-600">({message.length}/140)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 140))}
              placeholder="Leave a question, insight, or observation on the computational graph..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] focus:border-rose-500 focus:outline-none text-xs text-white placeholder-zinc-500 resize-none transition-colors"
              maxLength={140}
              required
            />
          </div>

          {/* Note Category */}
          <div>
            <label className="block font-tech text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
              NODE CATEGORY
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['note', 'idea', 'question', 'observation'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-lg font-tech text-[10px] uppercase tracking-wider border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                      : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accent & Shape Selectors */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Accent */}
            <div>
              <label className="block font-tech text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                ACCENT
              </label>
              <div className="flex gap-2">
                {(['crimson', 'white', 'zinc'] as const).map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => setAccent(acc)}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-tech uppercase tracking-wider transition-all cursor-pointer ${
                      accent === acc
                        ? 'border-rose-500 bg-rose-500/20 text-white font-bold'
                        : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div>
              <label className="block font-tech text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                GEOMETRY
              </label>
              <div className="flex gap-2">
                {(['sticky', 'square', 'capsule'] as const).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => setShape(sh)}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-tech uppercase tracking-wider transition-all cursor-pointer ${
                      shape === sh
                        ? 'border-rose-500 bg-rose-500/20 text-white font-bold'
                        : 'border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(225,29,72,0.4)] flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Place Node on Graph</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
