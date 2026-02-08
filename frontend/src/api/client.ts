import type {
  Link, LinkCreate, LinkUpdate,
  SocialLink, SocialLinkCreate, SocialLinkUpdate,
  SiteConfig, UploadedFile,
} from "../types";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
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

// ── Public ──────────────────────────────────────────────
export const getVisibleLinks = () => request<Link[]>("/links");
export const getSiteConfig = () => request<SiteConfig>("/config");
export const getSocials = () => request<SocialLink[]>("/socials");
export const trackClick = (id: string) =>
  request<{ clicks: number }>(`/links/${id}/click`, { method: "POST" });

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
