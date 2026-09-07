import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, Copy, Check } from 'lucide-react';

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
    }, 2200);
  };

  const quickSubjects = [
    'Research Collaboration',
    'AI / ML Architecture',
    'Technical Advisory',
    'General Inquiry',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#09090b] border border-white/10 p-6 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white font-bold tracking-wide uppercase">
                Direct Inquiries
              </h3>
              <p className="font-body text-xs text-zinc-300">Reach Shubham Sharma for research or engineering advisory</p>
            </div>
          </div>
          <span className="font-accent text-3xl text-rose-300/80 leading-none hidden sm:inline">
            reach out
          </span>
        </div>

        {/* Quick Email Copy banner */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-between gap-2 mb-5">
          <div className="min-w-0">
            <div className="text-[11px] font-body font-semibold text-zinc-400 uppercase tracking-wider">Coordinates</div>
            <div className="text-xs sm:text-sm font-body font-semibold text-rose-300 truncate mt-0.5">{email}</div>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-body font-semibold transition-colors shrink-0 border border-white/[0.08]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Email'}</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-display text-xl text-white font-bold uppercase tracking-wide">Transmission Dispatched</h4>
            <p className="font-body text-sm text-zinc-200">
              Thank you for reaching out. Shubham will reply directly to your address.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-body font-semibold text-zinc-300 block mb-1.5 uppercase tracking-wider">
                Discussion Area
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickSubjects.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSubject(q)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                      subject === q
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-body font-semibold text-zinc-300 block mb-1 uppercase tracking-wider">Your Email</label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:border-rose-500 focus:outline-none font-body font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-body font-semibold text-zinc-300 block mb-1 uppercase tracking-wider">Message</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your inquiry or project scope..."
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:border-rose-500 focus:outline-none resize-none font-body font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold font-body transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Inquiries</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
