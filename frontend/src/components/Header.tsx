import { useState } from "react";
import type { SiteConfig } from "../types";

interface Props {
  config: SiteConfig | null;
}

const SHAPE_CLASSES: Record<string, string> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-none",
};

// Stable URL — the backend redirects/serves whatever logo is currently
// configured. Using a fixed URL here means index.html can `<link
// rel="preload" as="image">` it during HTML parse, so by the time React
// mounts the image is already in the browser cache.
const LOGO_URL = "/api/branding/logo";

export default function Header({ config }: Props) {
  // Hide the logo if the backend says no logo is configured (404). This
  // mirrors the original "render initials if no logo" behaviour.
  const [logoFailed, setLogoFailed] = useState(false);

  const accent = config?.secondary_color || "#D4AF37";
  const shapeClass =
    SHAPE_CLASSES[config?.logo_shape ?? "circle"] || "rounded-full";

  const showLogoImage = !logoFailed;

  return (
    <header className="header-enter flex flex-col items-center text-center mb-10">
      <div
        className={`w-24 h-24 ${shapeClass} bg-white/10 border-2 flex items-center justify-center mb-5 overflow-hidden`}
        style={{ borderColor: `${accent}66`, boxShadow: `0 0 15px ${accent}66` }}
      >
        {showLogoImage ? (
          <img
            src={LOGO_URL}
            alt={config?.site_title || "Logo"}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span
            className="text-3xl font-extrabold tracking-tighter select-none"
            style={{ color: accent }}
          >
            MSA
          </span>
        )}
      </div>

      {/* Title + bio: render only once config arrives. The wrapper preserves
          enough layout height that the link list below doesn't jump when
          the text appears. Sized for a typical 1-2 line bio. */}
      <div className="min-h-[4.5rem] sm:min-h-[5.5rem] flex flex-col items-center">
        {config && (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {config.site_title || "CMUQ MSA"}
            </h1>
            {config.site_bio && (
              <p className="text-white/70 mt-2 text-sm sm:text-base max-w-xs">
                {config.site_bio}
              </p>
            )}
          </>
        )}
      </div>
    </header>
  );
}
