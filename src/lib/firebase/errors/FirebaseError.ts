export class FirebaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'FirebaseError';
  }

  static fromError(error: unknown, defaultMessage: string): FirebaseError {
    if (error instanceof FirebaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new FirebaseError(
        error.message || defaultMessage,
        undefined,
        error
      );
    }

    return new FirebaseError(defaultMessage);
  }
}