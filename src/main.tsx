import { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application runtime failure caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('nodefolio_visitor_notes');
      localStorage.removeItem('nodefolio_visitor_version');
    } catch {}
    window.location.reload();
  };

  handleRecover = () => {
    try {
      localStorage.removeItem('nodefolio_visitor_notes');
    } catch {}
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#07090e] text-white p-6 text-center font-body select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mb-4 animate-pulse shadow-[0_0_12px_#f43f5e]" />
          <h1 className="font-mono text-sm uppercase tracking-widest text-zinc-300 font-semibold mb-2">
            Session Recovery
          </h1>
          <p className="font-mono text-xs text-zinc-500 max-w-md mb-6 leading-relaxed">
            A temporary workspace interruption occurred. You can resume session execution or reload the interface.
          </p>
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
