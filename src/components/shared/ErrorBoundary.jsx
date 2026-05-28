import { Component } from "react";
import { Home, RefreshCcw, AlertTriangle } from "lucide-react";

/**
 * ErrorBoundary — catches React render errors in the subtree.
 *
 * Usage (wrap any route or section):
 *   <ErrorBoundary>
 *     <TaskManager />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<MyFallback />}>
 *     <HeavyComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to Sentry / Datadog
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h2 className="font-display font-semibold text-lg text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            {this.state.error?.message || "An unexpected error occurred in this section."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="btn-secondary text-sm"
            >
              <RefreshCcw size={14} /> Try again
            </button>
            <a href="/dashboard" className="btn-primary text-sm">
              <Home size={14} /> Go home
            </a>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-6 text-left text-xs text-red-400/70 bg-red-500/5 rounded-xl p-4 max-w-lg overflow-auto max-h-40">
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;