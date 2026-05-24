import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import PublicPage from "./pages/PublicPage";
import { Loader2 } from "lucide-react";

const AdminPage = lazy(() => import("./pages/AdminPage"));

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-crimson-700 via-crimson to-crimson-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-white mb-4">404</h1>
        <p className="text-white/60 mb-6">Page not found</p>
        <Link to="/" className="btn-gold inline-flex items-center gap-2">Go Home</Link>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-crimson-700 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminPage />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
