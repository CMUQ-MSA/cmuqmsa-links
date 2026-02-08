import { useEffect, useState, useCallback } from "react";
import type { Link, SiteConfig, SocialLink, UploadedFile } from "../types";
import { SOCIAL_PLATFORMS } from "../types";
import * as api from "../api/client";
import {
  LogOut, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Save, Lock,
  Loader2, Pencil, X, Settings, Link2, Users, Upload, BarChart3,
  Image as ImageIcon, FileText, FolderOpen, Check,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   FILE PICKER MODAL
   ═══════════════════════════════════════════════════════════════ */
function FilePicker({
  onSelect,
  onClose,
  accept,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
  accept?: "image" | "all";
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.listFiles().then(setFiles).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isImage = (filename: string) =>
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(filename);

  const filtered =
    accept === "image" ? files.filter((f) => isImage(f.filename)) : files;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadFile(file);
      const updated = await api.listFiles();
      setFiles(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-gold" />
            Choose File
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload new */}
        <div className="px-5 pt-4">
          <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-600 transition-colors">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload new file
            <input
              type="file"
              accept={accept === "image" ? "image/*" : ".png,.jpg,.jpeg,.gif,.webp,.svg,.pdf,.ico"}
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>

        {/* File grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              No {accept === "image" ? "images" : "files"} uploaded yet
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((f) => (
                <button
                  key={f.filename}
                  onClick={() => onSelect(f.url)}
                  className="group relative border-2 border-gray-200 rounded-xl p-2 hover:border-gold hover:shadow-md transition-all text-left"
                >
                  {isImage(f.filename) ? (
                    <img
                      src={f.url}
                      alt={f.filename}
                      className="w-full h-20 object-cover rounded-lg mb-1.5"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-50 rounded-lg mb-1.5 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-gray-300" />
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 truncate">
                    {f.display_name || f.filename}
                  </p>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-gold text-white rounded-full p-1.5">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN SCREEN
   ═══════════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.login(password);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crimson-700 via-crimson to-crimson-900 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-crimson-700/10 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-crimson-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm">Enter the master password</p>
        </div>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg p-2 mb-4 text-center">{error}</p>
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field mb-4"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !password}
          className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: LINKS MANAGER
   ═══════════════════════════════════════════════════════════════ */
function LinksTab() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      setLinks(await api.getAllLinks());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleSave = async (id: string, data: Partial<Link>) => {
    await api.updateLink(id, data);
    setEditingId(null);
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    await api.deleteLink(id);
    fetchLinks();
  };

  const handleToggle = async (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    await api.updateLink(id, { visible: !link.visible });
    fetchLinks();
  };

  const handleMove = async (id: string, dir: "up" | "down") => {
    const idx = links.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const newLinks = [...links];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newLinks.length) return;
    [newLinks[idx], newLinks[swapIdx]] = [newLinks[swapIdx], newLinks[idx]];
    setLinks(newLinks);
    await api.reorderLinks(newLinks.map((l) => l.id));
  };

  const handleAdd = async (data: any) => {
    await api.createLink(data);
    fetchLinks();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {links.map((link, i) =>
        editingId === link.id ? (
          <LinkEditForm
            key={link.id}
            link={link}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <LinkRow
            key={link.id}
            link={link}
            isFirst={i === 0}
            isLast={i === links.length - 1}
            onEdit={() => setEditingId(link.id)}
            onDelete={() => handleDelete(link.id)}
            onMoveUp={() => handleMove(link.id, "up")}
            onMoveDown={() => handleMove(link.id, "down")}
            onToggle={() => handleToggle(link.id)}
          />
        ),
      )}
      <AddLinkForm onAdd={handleAdd} />
    </div>
  );
}

function LinkRow({
  link,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggle,
}: {
  link: Link;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border-2 p-4 shadow-md flex items-center gap-3 transition-colors ${
        link.visible ? "border-gold/30" : "border-gray-200 opacity-60"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="text-gray-400 hover:text-gold disabled:opacity-20 transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="text-gray-400 hover:text-gold disabled:opacity-20 transition-colors"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      {link.thumbnail_url ? (
        <img
          src={link.thumbnail_url}
          alt=""
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : null}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-800 font-semibold text-sm truncate">
            {link.title}
          </h3>
          {link.link_type !== "link" && (
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gold/10 text-gold-700">
              {link.link_type}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs truncate">{link.url}</p>
        <p className="text-gray-300 text-[10px] mt-0.5">
          <BarChart3 className="w-3 h-3 inline mr-1" />
          {link.clicks || 0} clicks
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggle}
          title={link.visible ? "Hide" : "Show"}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold transition-colors"
        >
          {link.visible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          title="Edit"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function LinkEditForm({
  link,
  onSave,
  onCancel,
}: {
  link: Link;
  onSave: (id: string, data: Partial<Link>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [description, setDescription] = useState(link.description);
  const [icon, setIcon] = useState(link.icon);
  const [thumbnailUrl, setThumbnailUrl] = useState(link.thumbnail_url);
  const [linkType, setLinkType] = useState(link.link_type);
  const [uploading, setUploading] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState<"thumbnail" | "url" | null>(null);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      setThumbnailUrl(result.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFilePickerSelect = (selectedUrl: string) => {
    if (showFilePicker === "thumbnail") {
      setThumbnailUrl(selectedUrl);
    } else if (showFilePicker === "url") {
      setUrl(selectedUrl);
    }
    setShowFilePicker(null);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gold p-5 shadow-lg space-y-3">
      {showFilePicker && (
        <FilePicker
          onSelect={handleFilePickerSelect}
          onClose={() => setShowFilePicker(null)}
          accept={showFilePicker === "thumbnail" ? "image" : "all"}
        />
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Edit Link
        </span>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <input
        className="input-field"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowFilePicker("url")}
          className="px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-gold text-gray-400 hover:text-gold transition-colors"
          title="Choose from uploaded files"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
      </div>
      <input
        className="input-field"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Icon name</label>
          <input
            className="input-field"
            placeholder="e.g. bus, heart, file-text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
          <select
            className="input-field"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as any)}
          >
            <option value="link">🔗 Link</option>
            <option value="pdf">📄 PDF / Document</option>
            <option value="image">🖼️ Image</option>
            <option value="embed">📦 Embed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Thumbnail (optional preview image)</label>
        <div className="flex items-center gap-2">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
        )}
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border-2 border-gray-200 text-gray-600 hover:border-gold hover:text-gold transition-colors">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {thumbnailUrl ? "Change" : "Upload"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbnailUpload}
          />
        </label>
        <button
          type="button"
          onClick={() => setShowFilePicker("thumbnail")}
          className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border-2 border-gray-200 text-gray-600 hover:border-gold hover:text-gold transition-colors"
        >
          <FolderOpen className="w-4 h-4" /> Browse
        </button>
        {thumbnailUrl && (
          <button
            onClick={() => setThumbnailUrl("")}
            className="text-gray-400 hover:text-red-500 text-xs"
          >
            Remove
          </button>
        )}
        </div>
      </div>
      <button
        onClick={() =>
          onSave(link.id, {
            title,
            url,
            description,
            icon,
            thumbnail_url: thumbnailUrl,
            link_type: linkType,
          })
        }
        className="btn-gold flex items-center gap-2"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
}

function AddLinkForm({ onAdd }: { onAdd: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("link");
  const [linkType, setLinkType] = useState("link");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState<"thumbnail" | "url" | null>(null);

  const submit = () => {
    if (!title || !url) return;
    onAdd({
      title,
      url,
      description,
      icon,
      link_type: linkType,
      thumbnail_url: thumbnailUrl,
    });
    setTitle("");
    setUrl("");
    setDescription("");
    setIcon("link");
    setLinkType("link");
    setThumbnailUrl("");
    setOpen(false);
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      setThumbnailUrl(result.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFilePickerSelect = (selectedUrl: string) => {
    if (showFilePicker === "thumbnail") {
      setThumbnailUrl(selectedUrl);
    } else if (showFilePicker === "url") {
      setUrl(selectedUrl);
    }
    setShowFilePicker(null);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add New Link
      </button>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-5 space-y-3">
      {showFilePicker && (
        <FilePicker
          onSelect={handleFilePickerSelect}
          onClose={() => setShowFilePicker(null)}
          accept={showFilePicker === "thumbnail" ? "image" : "all"}
        />
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          New Link
        </span>
        <button
          onClick={() => setOpen(false)}
          className="text-white/40 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <input
        className="input-field"
        placeholder="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="URL *"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowFilePicker("url")}
          className="px-3 py-2 rounded-lg border-2 border-white/20 hover:border-gold text-white/40 hover:text-gold transition-colors"
          title="Choose from uploaded files"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
      </div>
      <input
        className="input-field"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1">Icon name</label>
          <input
            className="input-field"
            placeholder="e.g. bus, heart, file-text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1">Type</label>
          <select
            className="input-field"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
          >
            <option value="link">🔗 Link</option>
            <option value="pdf">📄 PDF / Document</option>
            <option value="image">🖼️ Image</option>
            <option value="embed">📦 Embed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-white/40 mb-1">Thumbnail (optional preview image)</label>
        <div className="flex items-center gap-2">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
        )}
        <label className="cursor-pointer">
          <span className="btn-ghost text-sm inline-flex items-center gap-2">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Thumbnail
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbnailUpload}
          />
        </label>
        <button
          type="button"
          onClick={() => setShowFilePicker("thumbnail")}
          className="btn-ghost text-sm inline-flex items-center gap-2"
        >
          <FolderOpen className="w-4 h-4" /> Browse
        </button>
        {thumbnailUrl && (
          <button
            onClick={() => setThumbnailUrl("")}
            className="text-white/40 hover:text-red-400 text-xs"
          >
            Remove
          </button>
        )}
        </div>
      </div>
      <button
        onClick={submit}
        disabled={!title || !url}
        className="btn-gold w-full disabled:opacity-50"
      >
        Add Link
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: SITE SETTINGS
   ═══════════════════════════════════════════════════════════════ */
function SettingsTab() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    api.getSiteConfig().then(setConfig).catch(() => {});
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await api.updateConfig(config);
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const result = await api.uploadFile(file);
      setConfig((c) => (c ? { ...c, logo_url: result.url } : c));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  if (!config) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gold/30 p-6 shadow-lg space-y-5">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Settings className="w-5 h-5 text-gold" /> Site Settings
      </h2>

      {/* Logo */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-2">
          Logo / Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 ${
            config.logo_shape === "square" ? "rounded-none" :
            config.logo_shape === "rounded" ? "rounded-2xl" : "rounded-full"
          } bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden`}>
            {config.logo_url ? (
              <img
                src={config.logo_url}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-600 hover:border-gold hover:text-gold transition-colors">
                {logoUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Logo
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
            {config.logo_url && (
              <button
                onClick={() => setConfig({ ...config, logo_url: "" })}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {/* Logo Shape */}
        <div className="mt-3">
          <label className="text-xs font-medium text-gray-500 block mb-1.5">
            Logo Shape
          </label>
          <div className="flex gap-2">
            {([
              { id: "circle" as const, label: "Circle", preview: "rounded-full" },
              { id: "rounded" as const, label: "Rounded", preview: "rounded-lg" },
              { id: "square" as const, label: "Square", preview: "rounded-none" },
            ]).map((shape) => (
              <button
                key={shape.id}
                onClick={() => setConfig({ ...config, logo_shape: shape.id })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  config.logo_shape === shape.id
                    ? "border-gold bg-gold/10 text-gold-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <div className={`w-4 h-4 ${shape.preview} bg-gray-400`} />
                {shape.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Title & Bio */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-1">
          Site Title
        </label>
        <input
          className="input-field"
          value={config.site_title}
          onChange={(e) =>
            setConfig({ ...config, site_title: e.target.value })
          }
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-1">
          Bio
        </label>
        <textarea
          className="input-field resize-none"
          rows={3}
          value={config.site_bio}
          onChange={(e) => setConfig({ ...config, site_bio: e.target.value })}
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.primary_color}
              onChange={(e) =>
                setConfig({ ...config, primary_color: e.target.value })
              }
              className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
            />
            <input
              className="input-field flex-1"
              value={config.primary_color}
              onChange={(e) =>
                setConfig({ ...config, primary_color: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Accent Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.secondary_color}
              onChange={(e) =>
                setConfig({ ...config, secondary_color: e.target.value })
              }
              className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
            />
            <input
              className="input-field flex-1"
              value={config.secondary_color}
              onChange={(e) =>
                setConfig({ ...config, secondary_color: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Background style */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-2">
          Background Style
        </label>
        <div className="flex gap-3">
          {(["gradient", "solid", "noise"] as const).map((style) => (
            <button
              key={style}
              onClick={() =>
                setConfig({ ...config, background_style: style })
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                config.background_style === style
                  ? "border-gold bg-gold/10 text-gold-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="btn-gold flex items-center gap-2"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saved ? "Saved \u2713" : "Save Settings"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: SOCIAL LINKS
   ═══════════════════════════════════════════════════════════════ */
function SocialsTab() {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlatform, setNewPlatform] = useState("instagram");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");

  const fetchSocials = useCallback(async () => {
    setLoading(true);
    try {
      setSocials(await api.getAllSocials());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocials();
  }, [fetchSocials]);

  const handleAdd = async () => {
    if (!newUrl) return;
    try {
      await api.createSocial({ platform: newPlatform, url: newUrl });
      setNewUrl("");
      fetchSocials();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this social link?")) return;
    try {
      await api.deleteSocial(id);
      fetchSocials();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggle = async (id: string) => {
    const social = socials.find((s) => s.id === id);
    if (!social) return;
    try {
      await api.updateSocial(id, { visible: !social.visible });
      fetchSocials();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMove = async (id: string, dir: "up" | "down") => {
    const idx = socials.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const newSocials = [...socials];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newSocials.length) return;
    [newSocials[idx], newSocials[swapIdx]] = [newSocials[swapIdx], newSocials[idx]];
    setSocials(newSocials);
    try {
      await api.reorderSocials(newSocials.map((s) => s.id));
    } catch {
      fetchSocials();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editUrl) return;
    try {
      await api.updateSocial(editingId, { url: editUrl });
      setEditingId(null);
      fetchSocials();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {socials.map((s, i) => (
        <div
          key={s.id}
          className={`bg-white rounded-xl border-2 p-4 shadow-md flex items-center gap-3 ${
            s.visible ? "border-gold/30" : "border-gray-200 opacity-60"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => handleMove(s.id, "up")}
              disabled={i === 0}
              className="text-gray-400 hover:text-gold disabled:opacity-20 transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleMove(s.id, "down")}
              disabled={i === socials.length - 1}
              className="text-gray-400 hover:text-gold disabled:opacity-20 transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-gray-700 capitalize w-24">
            {SOCIAL_PLATFORMS[s.platform]?.label || s.platform}
          </span>
          {editingId === s.id ? (
            <div className="flex-1 flex gap-2">
              <input
                className="input-field flex-1 text-xs"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="px-2 py-1 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400 truncate flex-1">
              {s.url}
            </span>
          )}
          {editingId !== s.id && (
            <>
              <button
                onClick={() => { setEditingId(s.id); setEditUrl(s.url); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold transition-colors"
                title="Edit URL"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggle(s.id)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gold transition-colors"
              >
                {s.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ))}

      {/* Add new */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 space-y-3">
        <span className="text-sm font-semibold text-white/70 uppercase tracking-wide">
          Add Social
        </span>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="input-field"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
          >
            {Object.entries(SOCIAL_PLATFORMS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <input
            className="input-field"
            placeholder={
              SOCIAL_PLATFORMS[newPlatform]?.placeholder || "URL"
            }
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newUrl}
          className="btn-gold w-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: FILE MANAGER
   ═══════════════════════════════════════════════════════════════ */
function FilesTab() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await api.listFiles());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadFile(file);
      fetchFiles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Delete this file?")) return;
    await api.deleteFile(filename);
    fetchFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isImage = (filename: string) =>
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(filename);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="btn-ghost w-full flex items-center justify-center gap-2 cursor-pointer">
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        Upload File (images, PDFs, up to 10 MB)
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.pdf,.ico"
          className="hidden"
          onChange={handleUpload}
        />
      </label>

      {files.length === 0 && (
        <p className="text-center text-white/40 py-8">
          No files uploaded yet
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {files.map((f) => (
          <div
            key={f.filename}
            className="bg-white rounded-xl border-2 border-gold/20 p-3 shadow-md group relative"
          >
            {isImage(f.filename) ? (
              <img
                src={f.url}
                alt={f.filename}
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
            ) : (
              <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
            )}
            <p className="text-xs text-gray-600 truncate" title={f.display_name || f.filename}>
              {f.display_name || f.filename}
            </p>
            <p className="text-[10px] text-gray-400">
              {formatSize(f.size)}
            </p>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(f.url);
                  setCopiedFile(f.filename);
                  setTimeout(() => setCopiedFile(null), 2000);
                }}
                className={`flex-1 text-[10px] text-center py-1 rounded transition-colors ${
                  copiedFile === f.filename
                    ? "bg-gold/20 text-gold-700"
                    : "bg-gray-100 hover:bg-gold/10 text-gray-500"
                }`}
              >
                {copiedFile === f.filename ? "Copied ✓" : "Copy URL"}
              </button>
              <button
                onClick={() => handleDelete(f.filename)}
                className="px-2 py-1 bg-red-50 rounded hover:bg-red-100 text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD (tab container)
   ═══════════════════════════════════════════════════════════════ */
type Tab = "links" | "settings" | "socials" | "files";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "links", label: "Links", icon: Link2 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "socials", label: "Socials", icon: Users },
  { id: "files", label: "Files", icon: Upload },
];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("links");

  return (
    <div className="min-h-screen bg-gradient-to-br from-crimson-700 via-crimson to-crimson-900 px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-white/50 text-sm">CMUQ MSA Links</p>
          </div>
          <button
            onClick={onLogout}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/10 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-white text-gray-800 shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "links" && <LinksTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "socials" && <SocialsTab />}
        {tab === "files" && <FilesTab />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PAGE (entry point)
   ═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .checkSession()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crimson-700 via-crimson to-crimson-900 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-gold animate-spin" />
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { api.logout().catch(() => {}); setAuthed(false); }} />;
}
