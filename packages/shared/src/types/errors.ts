/**
 * Error Type Definitions
 *
 * Type-safe error handling for API responses and application errors.
 */

/**
 * Standard API error response structure
 *
 * All API errors should follow this structure for consistency.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Extended Error type with HTTP response information
 *
 * Used for errors returned from API calls via axios or fetch.
 */
export interface ApiError extends Error {
  response?: {
    status: number;
    data: ApiErrorResponse;
  };
}

/**
 * Type guard to check if an error is an ApiError
 *
 * @param error - Unknown error object
 * @returns True if error is an ApiError with response property
 *
 * @example
 * ```typescript
 * try {
 *   await api.createMeeting(data);
 * } catch (error) {
 *   if (isApiError(error)) {
 *     const message = error.response?.data?.error?.message;
 *     toast.error(message);
 *   }
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}
