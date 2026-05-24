/// <reference types="vite/client" />

import type { Link, SiteConfig, SocialLink } from "./types";

declare global {
  interface Window {
    /**
     * Server-injected bootstrap data. Populated by the backend's SPA shell
     * route (see backend/app/routers/spa.py). When present, the public page
     * uses it for first paint instead of waiting on /api/public/bootstrap.
     */
    __BOOTSTRAP__?: {
      config: SiteConfig;
      links: Link[];
      socials: SocialLink[];
    };
  }
}

export {};
