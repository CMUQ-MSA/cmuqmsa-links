import { Link as LinkType } from "../types";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ExternalLink, FileText, ImageIcon } from "lucide-react";
import { trackClick } from "../api/client";

// Dynamically resolve a Lucide icon by name
function getIcon(name: string) {
  const formatted = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("") as keyof typeof Icons;
  const Icon = Icons[formatted] as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  return Icon || ExternalLink;
}

// Type-specific badge icons
const TYPE_BADGES: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: ImageIcon,
  embed: ExternalLink,
};

interface Props {
  link: LinkType;
  index: number;
  accent?: string;
}

export default function LinkCard({ link, index, accent = "#D4AF37" }: Props) {
  const Icon = getIcon(link.icon || "link");
  const TypeBadge = TYPE_BADGES[link.link_type];

  const handleClick = () => {
    trackClick(link.id).catch(() => {}); // fire and forget
  };

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="bg-white/95 backdrop-blur-sm border-2 rounded-xl shadow-lg p-4 transition-all duration-300 ease-out cursor-pointer group flex items-center gap-4"
      style={{
        borderColor: `${accent}4D`,
        "--hover-border": accent,
        "--hover-glow": `0 0 15px ${accent}66`,
      } as React.CSSProperties}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02, borderColor: accent, boxShadow: `0 0 15px ${accent}66` }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Thumbnail or Icon */}
      {link.thumbnail_url ? (
        <div className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={link.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
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

      {/* Text */}
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

      {/* Arrow */}
      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </motion.a>
  );
}
