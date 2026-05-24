import { Link as LinkType } from "../types";
import { ExternalLink } from "lucide-react";
import { getLinkIcon, TYPE_BADGE_ICONS } from "../lib/icons";
import { trackClick } from "../api/client";

interface Props {
  link: LinkType;
  index: number;
  accent?: string;
}

export default function LinkCard({ link, index, accent = "#D4AF37" }: Props) {
  const Icon = getLinkIcon(link.icon || "link");
  const TypeBadge = TYPE_BADGE_ICONS[link.link_type as keyof typeof TYPE_BADGE_ICONS];

  const handleClick = () => {
    trackClick(link.id).catch(() => {});
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="link-card-enter bg-white/95 backdrop-blur-sm border-2 rounded-xl shadow-lg p-4 transition-all duration-300 ease-out cursor-pointer group flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        borderColor: `${accent}4D`,
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 0 15px ${accent}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${accent}4D`;
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {link.thumbnail_url ? (
        <div className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={link.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div
          className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: `${accent}1A` }}
        >
          <Icon className="w-5 h-5 transition-colors" style={{ color: accent }} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-800 font-semibold text-base truncate">
            {link.title}
          </h3>
          {TypeBadge && link.link_type !== "link" && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
              style={{ backgroundColor: `${accent}1A`, color: accent }}
            >
              <TypeBadge className="w-3 h-3" />
              {link.link_type}
            </span>
          )}
        </div>
        {link.description && (
          <p className="text-gray-500 text-sm truncate">{link.description}</p>
        )}
      </div>

      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </a>
  );
}
