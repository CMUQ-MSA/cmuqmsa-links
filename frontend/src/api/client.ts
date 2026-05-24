import type {
  Link, LinkCreate, LinkUpdate,
  SocialLink, SocialLinkCreate, SocialLinkUpdate,
  SiteConfig, UploadedFile,
} from "../types";

const BASE = "/api";

interface BaseRequestOptions extends RequestInit {
  credentials?: RequestCredentials;
}

async function baseRequest<T>(path: string, options: BaseRequestOptions): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 204) return null as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Admin reads/writes: cookies attached, CSRF tied to session.
function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return baseRequest<T>(path, { credentials: "include", ...options });
}

// Public reads: no cookies, no admin session. Cacheable by browser/CDN.
// `mode: "cors"` + omitted credentials lets us match a `<link rel="preload"
// as="fetch" ... crossorigin>` hint in index.html.
function requestPublic<T>(path: string, options: RequestInit = {}): Promise<T> {
  return baseRequest<T>(path, {
    credentials: "omit",
    mode: "cors",
    ...options,
  });
}

// ── Public ──────────────────────────────────────────────
export interface BootstrapPayload {
  config: SiteConfig;
  links: Link[];
  socials: SocialLink[];
}

// Single round-trip for the public landing page. Matches the preload hint
// in index.html. Falls back to individual fetches if the endpoint is
// missing (e.g. running against an older backend during a partial deploy).
export async function getBootstrap(): Promise<BootstrapPayload> {
  try {
    return await requestPublic<BootstrapPayload>("/public/bootstrap");
  } catch (err) {
    const [config, links, socials] = await Promise.all([
      getSiteConfig(),
      getVisibleLinks(),
      getSocials(),
    ]);
    return { config, links, socials };
  }
}

export const getVisibleLinks = () => requestPublic<Link[]>("/links");
export const getSiteConfig = () => requestPublic<SiteConfig>("/config");
export const getSocials = () => requestPublic<SocialLink[]>("/socials");
export const trackClick = (id: string) =>
  requestPublic<{ clicks: number }>(`/links/${id}/click`, { method: "POST" });

// ── Auth ────────────────────────────────────────────────
export const login = (password: string) =>
  request<{ status: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

export const logout = () =>
  request<{ status: string }>("/auth/logout", { method: "POST" });

export const checkSession = () =>
  request<{ role: string }>("/auth/me");

// ── Admin Links ─────────────────────────────────────────
export const getAllLinks = () => request<Link[]>("/links/all");

export const createLink = (data: LinkCreate) =>
  request<Link>("/links", { method: "POST", body: JSON.stringify(data) });

export const updateLink = (id: string, data: LinkUpdate) =>
  request<Link>(`/links/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteLink = (id: string) =>
  request<void>(`/links/${id}`, { method: "DELETE" });

export const reorderLinks = (ordered_ids: string[]) =>
  request<{ status: string }>("/links/reorder/batch", {
    method: "PUT",
    body: JSON.stringify({ ordered_ids }),
  });

// ── Admin Config ────────────────────────────────────────
export const updateConfig = (data: Partial<SiteConfig>) =>
  request<SiteConfig>("/config", { method: "PUT", body: JSON.stringify(data) });

// ── Admin Socials ───────────────────────────────────────
export const getAllSocials = () => request<SocialLink[]>("/socials/all");

export const createSocial = (data: SocialLinkCreate) =>
  request<SocialLink>("/socials", { method: "POST", body: JSON.stringify(data) });

export const updateSocial = (id: string, data: SocialLinkUpdate) =>
  request<SocialLink>(`/socials/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteSocial = (id: string) =>
  request<void>(`/socials/${id}`, { method: "DELETE" });

export const reorderSocials = (ordered_ids: string[]) =>
  request<{ status: string }>("/socials/reorder/batch", {
    method: "PUT",
    body: JSON.stringify({ ordered_ids }),
  });

// ── Admin Uploads ───────────────────────────────────────
export async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/uploads`, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Note: do NOT set Content-Type — browser will set it with boundary
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Upload failed");
  }
  return res.json();
}

export const listFiles = () => request<UploadedFile[]>("/uploads");
export const deleteFile = (filename: string) =>
  request<void>(`/uploads/${filename}`, { method: "DELETE" });
