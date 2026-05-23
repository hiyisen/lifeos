export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; pageSize: number };
  error?: string;
}

export function useApi() {
  const baseURL = '';

  const cleanParams = (params?: Record<string, string | number | undefined>) => {
    if (!params) return undefined;
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') cleaned[k] = String(v);
    }
    return cleaned;
  };

  const get = <T = any>(path: string, params?: Record<string, string | number | undefined>) =>
    $fetch<ApiResponse<T>>(path, { baseURL, params: cleanParams(params) });

  const post = <T = any>(path: string, body?: Record<string, unknown>) =>
    $fetch<ApiResponse<T>>(path, {
      baseURL,
      method: 'POST',
      body: body as Record<string, unknown>,
    });

  const put = <T = any>(path: string, body?: Record<string, unknown>) =>
    $fetch<ApiResponse<T>>(path, { baseURL, method: 'PUT', body: body as Record<string, unknown> });

  const patch = <T = any>(path: string, body?: Record<string, unknown>) =>
    $fetch<ApiResponse<T>>(path, {
      baseURL,
      method: 'PATCH',
      body: body as Record<string, unknown>,
    });

  const del = <T>(path: string) => $fetch<ApiResponse<T>>(path, { baseURL, method: 'DELETE' });

  return { get, post, put, patch, del };
}
