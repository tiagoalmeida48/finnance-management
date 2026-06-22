import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro de renderização capturado pelo ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-expense/10">
          <AlertTriangle className="h-8 w-8 text-expense" aria-hidden />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-bold text-text">Algo deu errado</h1>
          <p className="text-sm text-text-muted">
            Não foi possível exibir esta tela. Tente novamente ou recarregue a página.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-semibold text-bg transition-colors hover:bg-primary-hover"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-md bg-surface-2 px-4 py-2 font-semibold text-text transition-colors hover:bg-border"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
