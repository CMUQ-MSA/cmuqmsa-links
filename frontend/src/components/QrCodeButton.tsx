import { useState } from "react";
import { QrCode, X, Download } from "lucide-react";

interface Props {
  pageUrl: string;
  color?: string;
}

export default function QrCodeButton({ pageUrl, color }: Props) {
  const [open, setOpen] = useState(false);
  const query = new URLSearchParams({ url: pageUrl });

  if (color) {
    query.set("color", color);
  }

  const qrUrl = `/api/qr?${query.toString()}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-full bg-white/10 border border-white/20
                   flex items-center justify-center
                   hover:bg-gold hover:border-gold hover:shadow-glow
                   transition-all duration-300"
        title="Show QR Code"
      >
        <QrCode className="w-5 h-5 text-white" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-gray-800 font-bold text-lg mb-4">
              Scan to visit
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 inline-block">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <a
              href={qrUrl}
              download="cmuqmsa-qr.png"
              className="btn-gold inline-flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" /> Download QR
            </a>
          </div>
        </div>
      )}
    </>
  );
}
