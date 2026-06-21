import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Generates a clean JSON API response.
 * Sanitizes 500 error messages to prevent leaking stack traces or database info.
 */
export function apiError(
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const isInternalError = status >= 500;
  const responseMessage = isInternalError ? 'Internal Server Error' : message;

  const body: ApiErrorResponse = { error: responseMessage };
  
  // Only append validation or other debug details for non-500 client errors
  if (details && !isInternalError) {
    body.details = details;
  }

  return NextResponse.json(body, { status });
}
