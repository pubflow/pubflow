// src/adapters/next/components/ErrorBoundary.tsx
import React from 'react';
import { useRouter } from 'next/router';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error) => void;
  redirectTo?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class NextErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (this.props.onError) {
      this.props.onError(error);
    }

    // Log error to your error reporting service
    console.error('PubFlow Error:', error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.redirectTo) {
        if (typeof window !== 'undefined') {
          const router = useRouter();
          router.push(this.props.redirectTo);
        }
        return null;
      }

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={this.reset}
          />
        );
      }

      return (
        <div className="pubflow-error">
          <h2>Something went wrong</h2>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
