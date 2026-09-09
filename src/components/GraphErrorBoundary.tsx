import React, { Component, ErrorInfo, ReactNode } from 'react';

interface GraphErrorBoundaryProps {
  children: ReactNode;
  onResetGraph?: () => void;
}

interface GraphErrorBoundaryState {
  hasError: boolean;
}

export class GraphErrorBoundary extends Component<GraphErrorBoundaryProps, GraphErrorBoundaryState> {
  public override state: GraphErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GraphErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Graph runtime error caught by GraphErrorBoundary:', error, errorInfo);
  }

  handleRecover = () => {
    try {
      this.props.onResetGraph?.();
    } catch (e) {
      console.error('Error during graph reset:', e);
    }
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090e] text-zinc-300 p-8 text-center select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 mb-4 animate-pulse shadow-[0_0_12px_#f43f5e]" />
          <h2 className="font-mono text-sm tracking-widest uppercase text-zinc-200 font-semibold mb-2">
            Spatial Canvas Suspended
          </h2>
          <p className="font-mono text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
            The interactive workspace state was safely paused. You can resume the graph to restore the default computational layout.
          </p>
          <button
            type="button"
            onClick={this.handleRecover}
            className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono uppercase tracking-wider text-rose-300 hover:text-white border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer shadow-md"
          >
            Restore Canvas
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
