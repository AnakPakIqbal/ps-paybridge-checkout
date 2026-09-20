import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '../types/checkout';

/**
 * An API failure that keeps the HTTP status, so a page can tell "this link has expired"
 * (401) apart from every other failure without parsing message text.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface JsonResponse<TData> {
  data: TData;
  status: number;
}

/**
 * Fetches a token-scoped endpoint and unwraps the `{ data }` success envelope, keeping the
 * HTTP status: some endpoints use 202 to mean "accepted but not decided yet -- ask again".
 */
export async function requestJsonWithStatus<TData>(
  url: string,
  token: string,
  fallbackMessage: string,
  body?: Record<string, unknown>,
): Promise<JsonResponse<TData>> {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const data = (await res.json().catch((): ApiErrorEnvelope => ({}))) as ApiErrorEnvelope;
    throw new ApiError(data.error?.message ?? fallbackMessage, res.status);
  }

  return { data: ((await res.json()) as ApiSuccessEnvelope<TData>).data, status: res.status };
}

/** Fetches a token-scoped endpoint and unwraps the `{ data }` success envelope. */
export async function requestJson<TData>(
  url: string,
  token: string,
  fallbackMessage: string,
  body?: Record<string, unknown>,
): Promise<TData> {
  return (await requestJsonWithStatus<TData>(url, token, fallbackMessage, body)).data;
}
