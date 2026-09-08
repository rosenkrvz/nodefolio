import React, { useState, useEffect } from 'react';
import { Close, Mail, Send, CheckCircle, Copy, Check, ShieldCheck } from '../icons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, email }) => {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('Research Collaboration');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2400);
  };

  const quickSubjects = [
    'Research Collaboration',
    'Generative Models',
    'Neural Infrastructure',
    'Technical Advisory',
    'General Inquiry',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Direct Communication & Inquiry"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none font-body"
      onClick={onClose}
    >
      {/* Outer Glow Halo */}
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#14171d]/95 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(225,29,72,0.15)] p-6 sm:p-8 text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact dialog"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <Close className="w-5 h-5" />
        </button>

        {/* Protocol Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
            <span className="text-[11px] font-body font-bold text-rose-400 tracking-[0.25em] uppercase">
              COMMUNICATION PROTOCOL &bull; GATEWAY 01
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-white font-bold tracking-wide uppercase">
            Direct Inquiries
          </h3>
          <p className="font-body text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed max-w-md">
            Available for machine learning research collaborations, systems engineering, and technical advisory.
          </p>
        </div>

        {/* Tactile Coordinates Card */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.08] shadow-inner mb-6 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-body font-semibold text-zinc-400 uppercase tracking-widest">
                  Direct Email Coordinate
                </div>
                <div className="text-sm sm:text-[15px] font-body font-bold text-white tracking-wide truncate mt-0.5">
                  {email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-body font-semibold transition-all shrink-0 border border-white/[0.1] active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-rose-400" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-body text-zinc-400 pt-2 border-t border-white/[0.05]">
            <span className="flex items-center gap-1 text-zinc-400">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              <span>Direct encrypted route</span>
            </span>
            <span className="text-zinc-400">Typical turnaround &bull; 24h</span>
          </div>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(225,29,72,0.3)]">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-display text-2xl text-white font-bold uppercase tracking-wide">
                Transmission Dispatched
              </h4>
              <p className="font-body text-sm text-zinc-300 mt-1 max-w-sm mx-auto leading-relaxed">
                Thank you for your message. Your inquiry has been routed to Shubham Sharma. Expect a direct response shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-body">
            {/* Topic Pills */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-2 uppercase tracking-wider">
                Discussion Topic
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickSubjects.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSubject(q)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      subject === q
                        ? 'bg-rose-500/20 border border-rose-500 text-white font-semibold shadow-[0_0_12px_rgba(225,29,72,0.3)]'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1 uppercase tracking-wider">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="colleague@institution.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 focus:outline-none transition-colors font-medium"
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1 uppercase tracking-wider">
                Inquiry Scope &amp; Details
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your inquiry, collaboration proposition, or research scope..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 focus:outline-none transition-colors resize-none font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(225,29,72,0.4)] hover:shadow-[0_0_32px_rgba(225,29,72,0.6)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>DISPATCH INQUIRY</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
