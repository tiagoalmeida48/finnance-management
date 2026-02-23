export const normalizeRpcError = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  // Handle Supabase/PostgREST errors structure
  if (typeof error === "object" && error !== null) {
    const err = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
    };

    // Sometimes Supabase returns an object with a 'message' property
    if (typeof err.message === "string") {
      return err.message;
    }

    // Sometimes it might return details
    if (typeof err.details === "string") {
      return err.details;
    }

    // Or hint
    if (typeof err.hint === "string") {
      return `Error: ${err.hint}`;
    }
  }

  return "Ocorreu um erro desconhecido ao processar sua solicitação.";
};
