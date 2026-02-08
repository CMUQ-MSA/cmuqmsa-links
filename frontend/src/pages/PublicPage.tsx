import { useEffect, useState } from "react";
import type { Link, SiteConfig, SocialLink as SocialLinkType } from "../types";
import { getVisibleLinks, getSiteConfig, getSocials } from "../api/client";
import Header from "../components/Header";
import LinkCard from "../components/LinkCard";
import SocialBar from "../components/SocialBar";
import QrCodeButton from "../components/QrCodeButton";
import { Loader2 } from "lucide-react";

const DEFAULT_CONFIG: SiteConfig = {
  site_title: "CMUQ MSA",
  site_bio: "Serving the Muslim community at Carnegie Mellon University in Qatar",
  logo_url: "",
  logo_shape: "circle",
  primary_color: "#990000",
  secondary_color: "#D4AF37",
  background_style: "gradient",
};

export default function PublicPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [socials, setSocials] = useState<SocialLinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getVisibleLinks(), getSiteConfig(), getSocials()])
      .then(([linksData, configData, socialsData]) => {
        setLinks(linksData);
        setConfig({ ...DEFAULT_CONFIG, ...configData });
        setSocials(socialsData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Dynamic background based on config
  const bgStyle = (() => {
    const p = config.primary_color || "#990000";
    switch (config.background_style) {
      case "solid":
        return { backgroundColor: p };
      case "noise":
        return {
          backgroundColor: p,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        };
      default: // gradient
        return {
          background: `linear-gradient(135deg, ${p} 0%, ${adjustBrightness(p, -30)} 100%)`,
        };
    }
  })();

  const pageUrl = typeof window !== "undefined" ? window.location.origin : "";

  const accent = config.secondary_color || "#D4AF37";

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-16"
      style={bgStyle}
    >
      <div className="w-full max-w-md">
        <Header config={config} />

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: accent }} />
          </div>
        )}

        {error && (
          <p className="text-center text-red-200 bg-red-900/30 rounded-lg p-3 text-sm">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {links.map((link, i) => (
            <LinkCard key={link.id} link={link} index={i} accent={accent} />
          ))}
        </div>

        {/* Social icons */}
        <div className="mt-8">
          <SocialBar socials={socials} accent={accent} />
        </div>

        {/* QR code */}
        {pageUrl && (
          <div className="flex justify-center mt-4">
            <QrCodeButton pageUrl={pageUrl} />
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
