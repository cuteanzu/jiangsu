import type {
  AuthResponse,
  CityProfileDTO,
  CommentDTO,
  CreateCommentPayload,
  CreateSubmissionPayload,
  ExperienceDTO,
  LoginPayload,
  QADTO,
  RegisterPayload,
  ResetPasswordPayload,
  SchoolDTO,
  SchoolDetailDTO,
  SchoolSearchParams,
  SendCodePayload,
  SubmissionDTO,
  UpdateProfilePayload,
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
  getRefreshToken() {
    if (!storageAvailable()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setAuth(auth: AuthResponse) {
    if (!storageAvailable()) return;
    if (auth.token) window.localStorage.setItem(TOKEN_KEY, auth.token);
    if (auth.refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    window.dispatchEvent(new Event("jiangsu-auth-change"));
  },
  clear() {
    if (!storageAvailable()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new Event("jiangsu-auth-change"));
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
  sendCode(payload: SendCodePayload) {
    return apiClient.post<string>("/auth/send-code", payload, { auth: false });
  },
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
  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.put<AuthResponse>("/auth/profile", payload);
  },
  resetPassword(payload: ResetPasswordPayload) {
    return apiClient.post<void>("/auth/reset-password", payload, { auth: false });
  },
  async refresh() {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) throw new ApiError("Missing refresh token", 401);
    const auth = await apiClient.post<AuthResponse>("/auth/refresh", { refreshToken }, { auth: false });
    authStorage.setAuth(auth);
    return auth;
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
  experience(id: string) {
    return apiClient.get<ExperienceDTO>(`/experiences/${encodeURIComponent(id)}`);
  },
  qa(query: QueryParams = {}) {
    return apiClient.get<QADTO[]>("/qa", query);
  },
};

export const commentsApi = {
  bySchool(schoolId: number, page = 0, size = 20) {
    return apiClient.get<CommentDTO[]>(`/schools/${schoolId}/comments`, { page, size });
  },
  createForSchool(schoolId: number, payload: CreateCommentPayload) {
    return apiClient.post<CommentDTO>(`/schools/${schoolId}/comments`, payload);
  },
  like(commentId: number) {
    return apiClient.post<void>(`/comments/${commentId}/like`);
  },
  unlike(commentId: number) {
    return apiClient.remove<void>(`/comments/${commentId}/like`);
  },
};

export const userApi = {
  favorites() {
    return apiClient.get<SchoolDTO[]>("/user/favorites");
  },
  addFavorite(schoolId: number) {
    return apiClient.post<void>(`/user/favorites/${schoolId}`);
  },
  removeFavorite(schoolId: number) {
    return apiClient.remove<void>(`/user/favorites/${schoolId}`);
  },
  submissions() {
    return apiClient.get<SubmissionDTO[]>("/user/submissions");
  },
  createSubmission(payload: CreateSubmissionPayload) {
    return apiClient.post<SubmissionDTO>("/submissions", payload);
  },
};
