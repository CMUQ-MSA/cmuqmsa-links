import type { SiteConfig } from "../types";

interface Props {
  config: SiteConfig;
}

const SHAPE_CLASSES: Record<string, string> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-none",
};

export default function Header({ config }: Props) {
  const accent = config.secondary_color || "#D4AF37";
  const shapeClass = SHAPE_CLASSES[config.logo_shape] || "rounded-full";

  return (
    <header className="header-enter flex flex-col items-center text-center mb-10">
      <div
        className={`w-24 h-24 ${shapeClass} bg-white/10 border-2 flex items-center justify-center mb-5 overflow-hidden`}
        style={{ borderColor: `${accent}66`, boxShadow: `0 0 15px ${accent}66` }}
      >
        {config.logo_url ? (
          <img
            src={config.logo_url}
            alt={config.site_title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <span className="text-3xl font-extrabold tracking-tighter select-none" style={{ color: accent }}>
            MSA
          </span>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
        {config.site_title || "CMUQ MSA"}
      </h1>
      <p className="text-white/70 mt-2 text-sm sm:text-base max-w-xs">
        {config.site_bio || "Serving the Muslim community at Carnegie Mellon University in Qatar"}
      </p>
    </header>
  );
}
