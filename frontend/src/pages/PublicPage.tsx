import { useEffect, useState } from "react";
import type { Link, SiteConfig, SocialLink as SocialLinkType } from "../types";
import { getBootstrap } from "../api/client";
import Header from "../components/Header";
import LinkCard from "../components/LinkCard";
import SocialBar from "../components/SocialBar";
import QrCodeButton from "../components/QrCodeButton";
import { Loader2 } from "lucide-react";

// Visual defaults used ONLY for chrome (background colour, accent) before
// the bootstrap call returns. We intentionally do NOT use the real
// `site_title` / `site_bio` / `logo_url` here — those would cause a flash
// of placeholder text before the DB value paints.
const FALLBACK_PRIMARY = "#990000";
const FALLBACK_ACCENT = "#D4AF37";

export default function PublicPage() {
  const [links, setLinks] = useState<Link[] | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [socials, setSocials] = useState<SocialLinkType[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getBootstrap()
      .then(({ config: c, links: l, socials: s }) => {
        setConfig(c);
        setLinks(l);
        setSocials(s);
      })
      .catch((e) => setError(e.message));
  }, []);

  const primary = config?.primary_color || FALLBACK_PRIMARY;
  const accent = config?.secondary_color || FALLBACK_ACCENT;

  // Dynamic background — uses fallback primary until config arrives so the
  // page doesn't flash white. The colour difference between fallback and
  // a custom palette is small enough that it isn't jarring.
  const bgStyle = (() => {
    switch (config?.background_style) {
      case "solid":
        return { backgroundColor: primary };
      case "noise":
        return {
          backgroundColor: primary,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        };
      default: // gradient (also used while config is null)
        return {
          background: `linear-gradient(135deg, ${primary} 0%, ${adjustBrightness(primary, -30)} 100%)`,
        };
    }
  })();

  const pageUrl = typeof window !== "undefined" ? window.location.origin : "";

  const loading = config === null || links === null || socials === null;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-16"
      style={bgStyle}
    >
      <div className="w-full max-w-md">
        <Header config={config} />

        {loading && !error && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: accent }} />
          </div>
        )}

        {error && (
          <p className="text-center text-red-200 bg-red-900/30 rounded-lg p-3 text-sm">
            {error}
          </p>
        )}

        {links && (
          <div className="flex flex-col gap-3">
            {links.map((link, i) => (
              <LinkCard key={link.id} link={link} index={i} accent={accent} />
            ))}
          </div>
        )}

        {/* Social icons */}
        {socials && socials.length > 0 && (
          <div className="mt-8">
            <SocialBar socials={socials} accent={accent} />
          </div>
        )}

        {/* QR code — only renders once we know the accent palette */}
        {pageUrl && config && (
          <div className="flex justify-center mt-4">
            <QrCodeButton pageUrl={pageUrl} color={config.primary_color} />
          </div>
        )}

        <p className="text-center text-white/30 text-xs mt-10">
          © {new Date().getFullYear()} CMUQ Muslim Students Association
        </p>
      </div>
    </div>
  );
}

// Utility: darken/lighten a hex color
function adjustBrightness(hex: string, amount: number): string {
  let color = hex.replace("#", "");
  if (color.length === 3) color = color.split("").map(c => c + c).join("");
  const num = parseInt(color, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
