import {
  Instagram,
  Mail,
  MessageCircle,
  Github,
  Youtube,
  Linkedin,
  Globe,
  Send,
  Music2,
  Twitter,
} from "lucide-react";
import type { SocialLink } from "../types";

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  email: Mail,
  github: Github,
  youtube: Youtube,
  linkedin: Linkedin,
  telegram: Send,
  tiktok: Music2,
  x: Twitter,
  website: Globe,
};

interface Props {
  socials: SocialLink[];
  accent?: string;
}

export default function SocialBar({ socials, accent = "#D4AF37" }: Props) {
  if (!socials.length) return null;

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {socials.map((s) => {
        const Icon = PLATFORM_ICONS[s.platform] || Globe;
        return (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.platform}
            title={s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20
                       flex items-center justify-center
                       transition-all duration-300 hover:scale-110"
            style={{
              "--social-accent": accent,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.borderColor = accent;
              e.currentTarget.style.boxShadow = `0 0 15px ${accent}66`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </a>
        );
      })}
    </div>
  );
}
