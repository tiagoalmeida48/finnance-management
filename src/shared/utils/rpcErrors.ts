export const normalizeRpcError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
    };

    if (typeof err.message === 'string') {
      return err.message;
    }

    if (typeof err.details === 'string') {
      return err.details;
    }

    if (typeof err.hint === 'string') {
      return `Error: ${err.hint}`;
    }
  }

  return 'Ocorreu um erro desconhecido ao processar sua solicitação.';
};
