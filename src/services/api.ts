import type {
  AuthResponse,
  CityProfileDTO,
  ExperienceDTO,
  LoginPayload,
  QADTO,
  RegisterPayload,
  SchoolDTO,
  SchoolDetailDTO,
  SchoolSearchParams,
  UniversityDTO,
} from "./types";

const DEFAULT_API_BASE_URL = "/api";
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: QueryParams;
  auth?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: number;
  readonly payload?: unknown;

  constructor(message: string, status: number, code?: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

function storageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export const authStorage = {
  getToken() {
    if (!storageAvailable()) return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setAuth(auth: AuthResponse) {
    if (!storageAvailable()) return;
    window.localStorage.setItem(TOKEN_KEY, auth.token);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  },
  clear() {
    if (!storageAvailable()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

function appendQuery(path: string, query?: QueryParams) {
  if (!query) return path;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  if (!queryString) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${queryString}`;
}

function resolveUrl(path: string, query?: QueryParams) {
  if (/^https?:\/\//i.test(path)) return appendQuery(path, query);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return appendQuery(`${getApiBaseUrl()}${normalizedPath}`, query);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isApiResult(value: unknown): value is { code: number; message?: string; data: unknown } {
  return isRecord(value) && typeof value.code === "number" && "data" in value;
}

function isJsonPayload(value: unknown) {
  return (
    value !== undefined &&
    value !== null &&
    typeof value === "object" &&
    !(value instanceof FormData) &&
    !(value instanceof URLSearchParams) &&
    !(value instanceof Blob) &&
    !(value instanceof ArrayBuffer)
  );
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<unknown>;
  }
  return response.text();
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, query, auth = true, headers: customHeaders, ...requestOptions } = options;
  const headers = new Headers(customHeaders);
  const token = auth ? authStorage.getToken() : null;

  let requestBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (isJsonPayload(body)) {
      requestBody = JSON.stringify(body);
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    } else {
      requestBody = body as BodyInit;
    }
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(path, query), {
    ...requestOptions,
    headers,
    body: requestBody,
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) authStorage.clear();
    throw new ApiError(response.statusText || "Request failed", response.status, undefined, payload);
  }

  if (isApiResult(payload)) {
    if (payload.code === 200) return payload.data as T;
    if (payload.code === 401 || payload.code === 403) authStorage.clear();
    throw new ApiError(payload.message || "Request failed", response.status, payload.code, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, query?: QueryParams) {
    return apiRequest<T>(path, { method: "GET", query });
  },
  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body" | "method">) {
    return apiRequest<T>(path, { ...options, method: "POST", body });
  },
  put<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body" | "method">) {
    return apiRequest<T>(path, { ...options, method: "PUT", body });
  },
  remove<T>(path: string, options?: Omit<ApiRequestOptions, "method">) {
    return apiRequest<T>(path, { ...options, method: "DELETE" });
  },
};

export const authApi = {
  async login(payload: LoginPayload) {
    const auth = await apiClient.post<AuthResponse>("/auth/login", payload, { auth: false });
    authStorage.setAuth(auth);
    return auth;
  },
  async register(payload: RegisterPayload) {
    const auth = await apiClient.post<AuthResponse>("/auth/register", payload, { auth: false });
    authStorage.setAuth(auth);
    return auth;
  },
  me() {
    return apiClient.get<AuthResponse>("/auth/me");
  },
  async logout() {
    try {
      await apiClient.post<void>("/auth/logout");
    } finally {
      authStorage.clear();
    }
  },
};

export const schoolsApi = {
  search(params: SchoolSearchParams = {}) {
    return apiClient.get<SchoolDTO[]>("/schools", params);
  },
  hot(limit = 6) {
    return apiClient.get<SchoolDTO[]>("/schools/hot", { limit });
  },
  detail(id: number) {
    return apiClient.get<SchoolDetailDTO>(`/schools/${id}`);
  },
  listUniversities() {
    return apiClient.get<UniversityDTO[]>("/schools/universities");
  },
  university(code: string) {
    return apiClient.get<UniversityDTO>(`/schools/universities/${encodeURIComponent(code)}`);
  },
};

export const citiesApi = {
  list() {
    return apiClient.get<CityProfileDTO[]>("/cities/profiles");
  },
  stats() {
    return apiClient.get<unknown>("/cities/stats");
  },
};

export const contentApi = {
  experiences(query: QueryParams = {}) {
    return apiClient.get<ExperienceDTO[]>("/experiences", query);
  },
  qa(query: QueryParams = {}) {
    return apiClient.get<QADTO[]>("/qa", query);
  },
};
