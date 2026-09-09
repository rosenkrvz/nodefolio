import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };
  public override props: Readonly<ErrorBoundaryProps>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Nodefolio:', error, errorInfo);
  }

  handleReload = () => {
    try {
      // Clear visitor notes cache in case corrupted notes caused failure
      localStorage.removeItem('nodefolio_visitor_notes');
    } catch {}
    window.location.reload();
  };

  handleRecover = () => {
    try {
      localStorage.removeItem('nodefolio_visitor_notes');
    } catch {}
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#090b10] text-white p-6 text-center font-body select-none">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 mb-4 animate-ping shadow-[0_0_12px_#f43f5e]" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider mb-2">System Reconnecting</h1>
          <p className="font-body text-zinc-400 text-sm max-w-md mb-6 leading-relaxed">
            A temporary rendering state was encountered. You can reload the interface or perform an automatic cache recovery.
          </p>
          {this.state.error && (
            <div className="mb-6 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-mono text-[11px] max-w-lg truncate">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleRecover}
              className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold uppercase tracking-wider text-zinc-200 hover:text-white border border-white/10 transition-all cursor-pointer shadow-md"
            >
              Resume Graph
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold uppercase tracking-wider text-white transition-all cursor-pointer shadow-lg shadow-rose-900/30"
            >
              Reload Interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

