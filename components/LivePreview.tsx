

import React, { Component, useEffect, useState, useRef, ReactNode } from 'react';
import { AlertTriangle, Loader2, Accessibility } from 'lucide-react';
import { compileComponent, CompilationResult } from '../utils/runtime';
// @ts-ignore
import axe from 'axe-core';

interface LivePreviewProps {
  code: string;
  scope?: Record<string, any>;
  title?: string;
  enableA11yCheck?: boolean;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: Readonly<ErrorBoundaryProps> & Readonly<{ children?: ReactNode }>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error || new Error("Unknown runtime error"));
    }
    return this.props.children;
  }
}

// Accessible Wrapper Component
const A11yWrapper: React.FC<{ children: ReactNode; title: string; issues: any[] }> = ({ children, title, issues }) => {
    return (
        <section 
            aria-label={`Custom Widget: ${title}`} 
            className="relative w-full h-full"
        >
            {issues.length > 0 && (
                <div className="absolute top-0 right-0 z-50 p-2">
                    <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber-200 dark:border-amber-800 pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                        <Accessibility size={10} />
                        <span>{issues.length} A11y Issues</span>
                    </div>
                </div>
            )}
            {/* Screen Reader Announcement */}
            <div className="sr-only" role="status" aria-live="polite">
                {title} widget loaded. {issues.length > 0 ? `Warning: ${issues.length} accessibility issues detected.` : 'Accessibility checks passed.'}
            </div>
            {/* Focus Guard for Keyboard Nav safety if issues exist */}
            <div tabIndex={0} className="sr-only">Start of widget {title}</div>
            {children}
            <div tabIndex={0} className="sr-only">End of widget {title}</div>
        </section>
    );
};

export const LivePreview: React.FC<LivePreviewProps> = ({ code, scope = {}, title = "Widget", enableA11yCheck = false }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [a11yIssues, setA11yIssues] = useState<any[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    
    const run = async () => {
      if (!Component) {
          setCompiling(true);
      }
      
      setError(null);
      setA11yIssues([]);

      await new Promise(r => setTimeout(r, 0));

      const result: CompilationResult = compileComponent(code, scope);
      
      if (active) {
        if (result.error) {
          setError(result.error);
          setComponent(null);
        } else {
          setComponent(() => result.component);
          setError(null);
        }
        setCompiling(false);
      }
    };

    run();

    return () => { active = false; };
  }, [code, scope]); 

  // Run Axe Checks after render
  useEffect(() => {
    if (!enableA11yCheck || !Component || !containerRef.current) return;

    const runCheck = async () => {
        // Short delay to ensure DOM is painted
        await new Promise(r => setTimeout(r, 500));
        if (!containerRef.current) return;

        try {
            const results = await axe.run(containerRef.current, {
                runOnly: {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa']
                }
            });
            if (results.violations.length > 0) {
                console.warn("A11y Violations:", results.violations);
                setA11yIssues(results.violations);
            }
        } catch (e) {
            console.error("Axe Error:", e);
        }
    };
    runCheck();
  }, [Component, enableA11yCheck]);

  if (compiling && !Component) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500 animate-pulse">
        <Loader2 className="w-6 h-6 mb-2 animate-spin" />
        <span className="text-xs font-medium uppercase tracking-wide">Building...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10">
        <AlertTriangle className="w-8 h-8 mb-3 opacity-50" />
        <h3 className="font-semibold text-sm mb-2">Compilation Failed</h3>
        <pre className="text-xs font-mono whitespace-pre-wrap text-center max-w-full text-red-600/80 dark:text-red-300/80 bg-red-100/50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </pre>
      </div>
    );
  }

  if (!Component) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-white dark:bg-zinc-950">
      <ErrorBoundary fallback={(err) => (
         <div className="flex flex-col items-center justify-center h-full p-6 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10">
           <AlertTriangle className="w-6 h-6 mb-2" />
           <p className="text-sm font-medium">Runtime Error</p>
           <pre className="text-xs mt-2 text-amber-700/70 dark:text-amber-400/70">{err.message}</pre>
         </div>
      )}>
        <A11yWrapper title={title} issues={a11yIssues}>
            <Component />
        </A11yWrapper>
      </ErrorBoundary>
      {compiling && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse z-50 pointer-events-none" />
      )}
    </div>
  );
};
