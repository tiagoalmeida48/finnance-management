export const normalizeRpcError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

<<<<<<< HEAD
=======
  // Handle Supabase/PostgREST errors structure
>>>>>>> finnance-management/main
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
    };

<<<<<<< HEAD
=======
    // Sometimes Supabase returns an object with a 'message' property
>>>>>>> finnance-management/main
    if (typeof err.message === 'string') {
      return err.message;
    }

<<<<<<< HEAD
=======
    // Sometimes it might return details
>>>>>>> finnance-management/main
    if (typeof err.details === 'string') {
      return err.details;
    }

<<<<<<< HEAD
=======
    // Or hint
>>>>>>> finnance-management/main
    if (typeof err.hint === 'string') {
      return `Error: ${err.hint}`;
    }
  }

  return 'Ocorreu um erro desconhecido ao processar sua solicitação.';
};
