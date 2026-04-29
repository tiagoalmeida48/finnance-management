import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

<<<<<<< HEAD
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
=======
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }
>>>>>>> finnance-management/main

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertTriangle className="size-10 text-[var(--color-error)]" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Algo deu errado nesta seção.
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">{this.state.message}</p>
          <button
            onClick={this.reset}
            className="mt-1 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
