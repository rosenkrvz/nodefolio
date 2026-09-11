import { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application runtime failure caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('nodefolio_visitor_notes');
      localStorage.removeItem('nodefolio_visitor_version');
      localStorage.removeItem('nodefolio_spec_pos');
    } catch {}
    window.location.reload();
  };

  handleRecover = () => {
    try {
      localStorage.removeItem('nodefolio_visitor_notes');
      localStorage.removeItem('nodefolio_spec_pos');
    } catch {}
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#07090e] text-white p-6 text-center font-body select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mb-4 animate-pulse shadow-[0_0_12px_#f43f5e]" />
          <h1 className="font-mono text-sm uppercase tracking-widest text-zinc-300 font-semibold mb-2">
            Session Recovery
          </h1>
          <p className="font-mono text-xs text-zinc-500 max-w-md mb-4 leading-relaxed">
            A temporary workspace interruption occurred. You can resume session execution or reload the interface.
          </p>
          {this.state.error && (
            <div className="max-w-xl w-full text-left bg-black/80 border border-rose-500/30 rounded-xl p-4 mb-6 font-mono text-xs text-rose-300 overflow-auto max-h-48 select-text">
              <div className="font-bold text-rose-400 mb-1">{this.state.error.name}: {this.state.error.message}</div>
              {this.state.error.stack && (
                <div className="text-[10px] text-zinc-400 whitespace-pre-wrap">{this.state.error.stack}</div>
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleRecover}
              className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-md"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-xs font-mono uppercase tracking-wider text-white transition-all cursor-pointer shadow-lg shadow-rose-900/30"
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
