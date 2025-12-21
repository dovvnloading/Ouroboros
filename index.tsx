import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertTriangle } from 'lucide-react';

// --- Error Suppression for Recharts ---
// The user has requested the removal of specific Recharts warnings related to 
// negative width/height calculations during initial layout shifts.
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const shouldSuppress = (args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string' && (
      msg.includes("width(-1) and height(-1) of chart should be greater than 0") || 
      msg.includes("minWidth(0) or minHeight(undefined)") ||
      msg.includes("defaultProps will be removed")
  )) {
    return true;
  }
  return false;
};

console.error = (...args) => {
  if (shouldSuppress(args)) return;
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  if (shouldSuppress(args)) return;
  originalConsoleWarn.apply(console, args);
};
// --------------------------------------

interface GlobalErrorBoundaryProps {
  children?: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends React.Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public state: GlobalErrorBoundaryState;
  public props: GlobalErrorBoundaryProps;

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-8 font-mono text-center selection:bg-red-900 selection:text-white">
            <div className="mb-6 p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                <AlertTriangle size={48} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">CRITICAL_FAILURE</h1>
            <p className="text-zinc-500 mb-8 uppercase tracking-widest text-xs">Runtime Exception Detected</p>
            
            <div className="bg-black/50 border border-zinc-800 rounded-xl p-6 max-w-2xl w-full overflow-auto mb-8 shadow-2xl">
                <code className="text-red-400 text-xs whitespace-pre-wrap break-all block text-left">
                    {this.state.error?.message || "Unknown Error"}
                    {this.state.error?.stack && `\n\n${this.state.error.stack}`}
                </code>
            </div>

            <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-bold transition-all hover:scale-105 active:scale-95"
            >
                REBOOT_SYSTEM()
            </button>
        </div>
      )
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
        <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);