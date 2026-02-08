export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  icon: string;
  thumbnail_url: string;
  link_type: "link" | "pdf" | "image" | "embed";
  position: number;
  visible: boolean;
  clicks: number;
  created_at: string;
}

export interface LinkCreate {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  thumbnail_url?: string;
  link_type?: string;
  visible?: boolean;
}

export interface LinkUpdate {
  title?: string;
  url?: string;
  description?: string;
  icon?: string;
  thumbnail_url?: string;
  link_type?: string;
  visible?: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  position: number;
  visible: boolean;
}

export interface SocialLinkCreate {
  platform: string;
  url: string;
}

export interface SocialLinkUpdate {
  platform?: string;
  url?: string;
  visible?: boolean;
}

export interface SiteConfig {
  site_title: string;
  site_bio: string;
  logo_url: string;
  logo_shape: "circle" | "rounded" | "square";
  primary_color: string;
  secondary_color: string;
  background_style: "gradient" | "solid" | "noise";
}

export interface UploadedFile {
  filename: string;
  display_name: string;
  url: string;
  size: number;
}

// Supported social platforms with their metadata
export const SOCIAL_PLATFORMS: Record<string, { label: string; placeholder: string }> = {
  instagram: { label: "Instagram", placeholder: "https://instagram.com/..." },
  tiktok: { label: "TikTok", placeholder: "https://tiktok.com/@..." },
  x: { label: "X (Twitter)", placeholder: "https://x.com/..." },
  youtube: { label: "YouTube", placeholder: "https://youtube.com/@..." },
  github: { label: "GitHub", placeholder: "https://github.com/..." },
  linkedin: { label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  whatsapp: { label: "WhatsApp", placeholder: "https://wa.me/..." },
  telegram: { label: "Telegram", placeholder: "https://t.me/..." },
  email: { label: "Email", placeholder: "mailto:..." },
  website: { label: "Website", placeholder: "https://..." },
};
