export interface ResultApi<T> {
  success: boolean;
  message: string;
  internalError: number;
  result: T;
}

export class ApiError extends Error {
  readonly internalError: number;
  readonly status: number;

  constructor(message: string, status: number, internalError = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.internalError = internalError;
  }
}
