"use client";

/**
 * =============================================================================
 * ADMIN CMS MANAGEMENT PAGE
 * =============================================================================
 * Allows administrators to customize storefront copy, photography, brand
 * storytelling, value pillars, bank wire credentials, and announcement banners
 * in real-time. All data is persisted to the database via /api/cms.
 * =============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Save,
  Building2,
  Sparkles,
  Megaphone,
  BookOpen,
  Loader2,
  ExternalLink,
  Shield,
  UploadCloud,
  Upload,
  Trash2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useToast } from "@/context/toast-context";

// ── 1. CONSTANTS & CONFIGURATION ─────────────────────────────────────────────

/**
 * Tab definitions for the CMS dashboard navigation.
 * Each tab corresponds to a configurable section of the storefront.
 */
const CMS_TABS = [
  { id: "hero", label: "Homepage Hero", icon: Sparkles },
  { id: "editorial", label: "Brand Editorial Story", icon: BookOpen },
  { id: "pillars", label: "Value Pillars", icon: Shield },
  { id: "bank", label: "Bank Wire Credentials", icon: Building2 },
  { id: "announcement", label: "Announcement Bar", icon: Megaphone },
] as const;

/** Type representing valid tab identifier keys */
type CmsTab = (typeof CMS_TABS)[number]["id"];

/**
 * Available Lucide icons selectable for value pillars.
 */
const PILLAR_ICON_OPTIONS = [
  { value: "Feather", label: "Feather (Artisanal / Materials)" },
  { value: "Shield", label: "Shield (Security / Verification)" },
  { value: "Compass", label: "Compass (Worldwide Shipping)" },
  { value: "Sparkles", label: "Sparkles (Quality)" },
  { value: "Award", label: "Award (Craftsmanship)" },
  { value: "CreditCard", label: "CreditCard (Payment)" },
];

/**
 * Form field mapping for Hero call-to-action buttons.
 */
const HERO_BUTTON_FIELDS = [
  { label: "Primary Button Label", key: "primaryButtonText" as const, placeholder: "e.g. SHOP COLLECTION" },
  { label: "Primary Button URL", key: "primaryButtonUrl" as const, placeholder: "e.g. /shop" },
  { label: "Secondary Button Label", key: "secondaryButtonText" as const, placeholder: "e.g. EXPLORE NEW ARRIVALS" },
  { label: "Secondary Button URL", key: "secondaryButtonUrl" as const, placeholder: "e.g. /shop?sort=newest" },
];

/**
 * Form field mapping for bank wire credentials displayed during checkout.
 */
const BANK_FIELDS = [
  { label: "Bank Name *", key: "bankName" as const, placeholder: "e.g. Standard Chartered / Chase Private" },
  { label: "Account Holder Name *", key: "accountName" as const, placeholder: "e.g. Company or Merchant Name" },
  { label: "Account Number / IBAN *", key: "accountNumber" as const, placeholder: "e.g. Account Number or IBAN" },
  { label: "Branch / Clearing Code *", key: "branch" as const, placeholder: "e.g. Branch Name / Routing / Sort Code" },
];

// ── 2. REUSABLE UI COMPONENTS ────────────────────────────────────────────────

/**
 * FormField: Renders a luxury styled text input or textarea with consistent typography and borders.
 */
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  rows,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  rows?: number;
}) {
  return (
    <div className={className}>
      {/* Field Label */}
      <label className="block uppercase tracking-wider font-semibold text-[#121212] text-xs mb-1">
        {label}
      </label>

      {/* Conditional rendering: textarea if rows is provided, otherwise standard input */}
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
        />
      )}
    </div>
  );
}

/**
 * TabHeader: Standardized header banner for each active CMS tab.
 */
function TabHeader({
  title,
  description,
  liveLink,
  action,
}: {
  title: string;
  description: string;
  liveLink?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[#E8E5E0]">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#121212]">
          {title}
        </h3>
        <p className="text-xs text-[#66635F]">{description}</p>
      </div>

      {/* Optional external link to preview storefront changes */}
      {liveLink && (
        <a
          href={liveLink}
          target="_blank"
          className="text-xs text-[#9B783E] hover:underline flex items-center gap-1 uppercase tracking-wider"
        >
          View Live <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Optional auxiliary action (e.g. Add Pillar button) */}
      {action}
    </div>
  );
}

/**
 * SaveButton: Standardized action button to persist settings to the database.
 * Supports optional children (e.g. left-aligned secondary action) in the same flex row.
 */
function SaveButton({
  onClick,
  saving,
  label,
  children,
}: {
  onClick: () => void;
  saving: boolean;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="pt-4 border-t border-[#E8E5E0] flex items-center justify-between">
      {/* Left side slot for auxiliary controls */}
      <div>{children}</div>

      {/* Save action trigger */}
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="px-8 py-3 bg-[#121212] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#9B783E] transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {label}
      </button>
    </div>
  );
}

/**
 * ImageUploadField: Drag-and-drop file uploader with direct upload to /api/upload,
 * loading indicator, image preview, removal button, and direct URL override fallback.
 */
function ImageUploadField({
  label,
  description,
  imageUrl,
  onImageChange,
  folderType = "cms",
}: {
  label: string;
  description?: string;
  imageUrl: string;
  onImageChange: (url: string) => void;
  folderType?: string;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Uploads file to /api/upload endpoint and updates the parent component's image state.
   */
  const handleFile = async (file: File) => {
    if (!file) return;

    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg|avif|gif)$/i.test(file.name);
    if (!isImage) {
      toast("Please select a valid image file (PNG, JPG, WEBP, SVG)", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", folderType);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload image");
      }

      const data = await res.json();
      onImageChange(data.url);
      toast("Image uploaded successfully", "success");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  /** Handles standard file input selection */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Handles drag-and-drop file drops */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      {/* Header with Title and Toggle for Direct URL input */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block uppercase tracking-wider font-semibold text-[#121212] text-xs">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-[#66635F] mt-0.5">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#9B783E] hover:underline flex items-center gap-1 uppercase tracking-wider font-medium cursor-pointer"
        >
          {showUrlInput ? "Hide URL Input" : "Or Enter URL"}
        </button>
      </div>

      {/* Hidden file input invoked programmatically */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Active Preview Mode when an image URL exists */}
      {imageUrl ? (
        <div className="relative border border-[#E8E5E0] bg-[#FAF8F5] p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-56 h-36 bg-[#F4F1EA] border border-[#E8E5E0] overflow-hidden shrink-0">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          </div>

          <div className="flex-1 space-y-2 text-xs w-full">
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Image loaded</span>
            </div>
            <p className="font-mono text-[11px] text-[#66635F] truncate max-w-md bg-white p-2 border border-[#E8E5E0]">
              {imageUrl}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-[#121212] text-white text-[11px] uppercase tracking-wider font-medium hover:bg-[#9B783E] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Upload New Image
              </button>
              <button
                type="button"
                onClick={() => onImageChange("")}
                className="px-3 py-2 border border-[#E8E5E0] text-[#66635F] text-[11px] uppercase tracking-wider hover:text-red-600 hover:border-red-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag-and-Drop Zone when no image is selected */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragOver
              ? "border-[#121212] bg-[#FAF8F5]"
              : "border-[#E8E5E0] bg-[#FAF8F5]/60 hover:border-[#121212] hover:bg-[#FAF8F5]"
            }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#9B783E]" />
              <p className="text-xs uppercase tracking-wider font-semibold text-[#121212]">
                Uploading Image...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <div className="p-3 bg-white border border-[#E8E5E0] rounded-full shadow-xs">
                <UploadCloud className="w-6 h-6 text-[#9B783E]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#121212]">
                  Click to upload image or drag and drop
                </p>
                <p className="text-[11px] text-[#8E8B85] mt-1">
                  Supports JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optional manual URL input fallback */}
      {showUrlInput && (
        <div className="pt-2">
          <label className="block uppercase tracking-wider font-semibold text-[#121212] text-[11px] mb-1">
            Direct Image URL (External or Local)
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="https://... or /uploads/cms/..."
            className="w-full bg-[#FAF8F5] border border-[#E8E5E0] p-2.5 text-xs text-[#121212] focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

// ── 3. MAIN CMS PAGE CONTROLLER ──────────────────────────────────────────────

export default function AdminCmsPage() {
  const { toast } = useToast();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<CmsTab>("hero");

  // Loading and asynchronous saving indicators
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Clean CMS state representations — initialized blank and populated from DB
  const [hero, setHero] = useState({
    tagline: "",
    title: "",
    subtitle: "",
    primaryButtonText: "",
    primaryButtonUrl: "",
    secondaryButtonText: "",
    secondaryButtonUrl: "",
    imageUrl: "",
  });

  const [editorial, setEditorial] = useState({
    tagline: "",
    title: "",
    paragraphs: ["", ""],
    imageUrl: "",
    imageAlt: "",
    stats: [
      { value: "", label: "" },
      { value: "", label: "" },
    ],
    buttonText: "",
    buttonUrl: "",
  });

  const [pillars, setPillars] = useState<
    { icon: string; title: string; description: string }[]
  >([]);

  const [bank, setBank] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    branch: "",
    swiftCode: "",
    instructions: "",
  });

  const [announcement, setAnnouncement] = useState({
    enabled: true,
    message: "",
    link: "",
  });

  // ── State Mutation Helpers ─────────────────────────────────────────────────

  /** Updates single field on the Hero state */
  const updateHero = (key: keyof typeof hero, val: string) =>
    setHero((prev) => ({ ...prev, [key]: val }));

  /** Updates single field on the Editorial state */
  const updateEditorial = <K extends keyof typeof editorial>(
    key: K,
    val: (typeof editorial)[K]
  ) => setEditorial((prev) => ({ ...prev, [key]: val }));

  /** Updates single field on the Bank state */
  const updateBank = (key: keyof typeof bank, val: string) =>
    setBank((prev) => ({ ...prev, [key]: val }));

  /** Updates a specific pillar in the Value Pillars array */
  const updatePillar = (
    index: number,
    key: "icon" | "title" | "description",
    val: string
  ) => {
    setPillars((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  /** Adds an empty pillar to the list */
  const handleAddPillar = () => {
    setPillars((prev) => [
      ...prev,
      { icon: "Feather", title: "", description: "" },
    ]);
  };

  /** Removes a pillar by array index */
  const handleRemovePillar = (index: number) => {
    setPillars((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Data Fetching Lifecycle ────────────────────────────────────────────────

  /**
   * Hydrates all CMS form sections from the /api/cms endpoint on mount.
   */
  useEffect(() => {
    setLoading(true);
    fetch("/api/cms")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, any>) => {
        // Hydrate Homepage Hero
        if (data?.hero_content) {
          const hc = data.hero_content;
          setHero({
            tagline: hc.tagline || "",
            title: hc.title || "",
            subtitle: hc.subtitle || "",
            primaryButtonText: hc.primaryButtonText || "",
            primaryButtonUrl: hc.primaryButtonUrl || "",
            secondaryButtonText: hc.secondaryButtonText || "",
            secondaryButtonUrl: hc.secondaryButtonUrl || "",
            imageUrl: hc.imageUrl || "",
          });
        }

        // Hydrate Bank Transfer Credentials
        if (data?.bank_details) {
          const bd = data.bank_details;
          setBank({
            bankName: bd.bankName || "",
            accountName: bd.accountName || "",
            accountNumber: bd.accountNumber || "",
            branch: bd.branch || "",
            swiftCode: bd.swiftCode || "",
            instructions: bd.instructions || "",
          });
        }

        // Hydrate Announcement Bar
        if (data?.announcement_bar) {
          const ab = data.announcement_bar;
          setAnnouncement({
            enabled: ab.enabled ?? true,
            message: ab.message || "",
            link: ab.link || "",
          });
        }

        // Hydrate Brand Editorial Story
        if (data?.editorial_section) {
          const ed = data.editorial_section;
          setEditorial({
            tagline: ed.tagline || "",
            title: ed.title || "",
            paragraphs:
              Array.isArray(ed.paragraphs) && ed.paragraphs.length > 0
                ? [ed.paragraphs[0] || "", ed.paragraphs[1] || ""]
                : ["", ""],
            imageUrl: ed.imageUrl || "",
            imageAlt: ed.imageAlt || "",
            stats:
              Array.isArray(ed.stats) && ed.stats.length > 0
                ? [
                  { value: ed.stats[0]?.value || "", label: ed.stats[0]?.label || "" },
                  { value: ed.stats[1]?.value || "", label: ed.stats[1]?.label || "" },
                ]
                : [
                  { value: "", label: "" },
                  { value: "", label: "" },
                ],
            buttonText: ed.buttonText || "",
            buttonUrl: ed.buttonUrl || "",
          });
        }

        // Hydrate Value Pillars list
        if (data?.value_pillars && Array.isArray(data.value_pillars)) {
          setPillars(data.value_pillars);
        }
      })
      .catch((e) => console.error("Failed to load CMS settings", e))
      .finally(() => setLoading(false));
  }, []);

  // ── Database Persistence ───────────────────────────────────────────────────

  /**
   * Persists a single configuration key-value pair to the database.
   */
  const handleSaveSetting = async (key: string, value: unknown, label: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (!res.ok) throw new Error(`Failed to save ${label}`);

      toast(`${label} updated successfully. Storefront updated.`, "success");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Error saving CMS setting", "error");
    } finally {
      setSaving(false);
    }
  };

  // Full-page spinner during initial data fetch
  if (loading) {
    return (
      <div className="p-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#9B783E]" />
      </div>
    );
  }

  // ── Page View Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-5xl">
      {/* ── Dashboard Page Header ── */}
      <div className="pb-6 border-b border-[#E8E5E0]">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#8E8B85]">
          Storefront Customizer
        </span>
        <h1 className="text-2xl sm:text-3xl font-light tracking-wide uppercase text-[#121212] mt-0.5">
          Content Management (CMS)
        </h1>
        <p className="text-xs text-[#66635F] mt-1">
          Configure storefront headlines, photography, brand editorial, value pillars, and payment wire details in real-time.
        </p>

        {/* ── Tab Navigation Switcher ── */}
        <div className="flex flex-wrap gap-2 pt-6">
          {CMS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border transition-colors flex items-center gap-2 cursor-pointer ${activeTab === tab.id
                    ? "bg-[#121212] text-white border-[#121212]"
                    : "bg-white text-[#66635F] border-[#E8E5E0] hover:border-[#121212]"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: HOMEPAGE HERO ── */}
      {activeTab === "hero" && (
        <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
          <TabHeader
            title="Editorial Fashion Hero"
            description="Main visual statement displayed at the top of the homepage"
            liveLink="/"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <FormField
              label="Badge / Tagline"
              value={hero.tagline}
              onChange={(v) => updateHero("tagline", v)}
              placeholder="Enter badge or brand tagline"
              className="sm:col-span-2"
            />

            <FormField
              label="Hero Headline (Uppercase)"
              value={hero.title}
              onChange={(v) => updateHero("title", v)}
              placeholder="Enter hero headline"
              className="sm:col-span-2"
            />

            <FormField
              label="Supporting Subtitle"
              value={hero.subtitle}
              onChange={(v) => updateHero("subtitle", v)}
              placeholder="Enter supporting subtitle"
              className="sm:col-span-2"
            />

            <div className="sm:col-span-2">
              <ImageUploadField
                label="Background Editorial Image"
                description="Upload photography displayed as the full-width hero background"
                imageUrl={hero.imageUrl}
                onImageChange={(url) => updateHero("imageUrl", url)}
              />
            </div>

            {/* Action buttons mapped from config */}
            {HERO_BUTTON_FIELDS.map(({ label, key, placeholder }) => (
              <FormField
                key={key}
                label={label}
                value={hero[key]}
                onChange={(v) => updateHero(key, v)}
                placeholder={placeholder}
              />
            ))}
          </div>

          <SaveButton
            onClick={() => handleSaveSetting("hero_content", hero, "Hero Content")}
            saving={saving}
            label="Publish Hero Changes"
          />
        </div>
      )}

      {/* ── TAB 2: BRAND EDITORIAL STORY ── */}
      {activeTab === "editorial" && (
        <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
          <TabHeader
            title="Brand Editorial & Craftsmanship Story"
            description="Displayed in the middle of the homepage to communicate brand identity"
            liveLink="/"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <FormField
              label="Story Tagline / Badge"
              value={editorial.tagline}
              onChange={(v) => updateEditorial("tagline", v)}
              placeholder="Enter story tagline or badge"
            />

            <FormField
              label="Headline"
              value={editorial.title}
              onChange={(v) => updateEditorial("title", v)}
              placeholder="Enter editorial headline"
            />

            {/* Story Paragraphs mapped */}
            {editorial.paragraphs.map((para, idx) => (
              <FormField
                key={idx}
                label={`Story Paragraph ${idx + 1}`}
                value={para}
                onChange={(v) => {
                  const next = [...editorial.paragraphs];
                  next[idx] = v;
                  updateEditorial("paragraphs", next);
                }}
                rows={3}
                placeholder={`Enter story paragraph ${idx + 1}...`}
                className="sm:col-span-2"
              />
            ))}

            <div className="sm:col-span-2">
              <ImageUploadField
                label="Editorial Craftsmanship Image"
                description="Upload photography showcasing tailoring, atelier workshops, or materials"
                imageUrl={editorial.imageUrl}
                onImageChange={(url) => updateEditorial("imageUrl", url)}
              />
            </div>

            {/* Editorial Numerical Metrics / Stats */}
            {editorial.stats.map((stat, idx) => (
              <div key={idx}>
                <label className="block uppercase tracking-wider font-semibold text-[#121212] text-xs mb-1">
                  Metric #{idx + 1} (Value & Label)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const next = [...editorial.stats];
                      next[idx] = { ...next[idx], value: e.target.value };
                      updateEditorial("stats", next);
                    }}
                    placeholder="e.g. 100%"
                    className="w-1/3 bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const next = [...editorial.stats];
                      next[idx] = { ...next[idx], label: e.target.value };
                      updateEditorial("stats", next);
                    }}
                    placeholder="e.g. Traceable Natural Fibers"
                    className="w-2/3 bg-[#FAF8F5] border border-[#E8E5E0] p-3 text-xs text-[#121212] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>
            ))}

            <FormField
              label="Action Button Text"
              value={editorial.buttonText}
              onChange={(v) => updateEditorial("buttonText", v)}
              placeholder="e.g. Explore The Collection"
            />

            <FormField
              label="Action Button Target URL"
              value={editorial.buttonUrl}
              onChange={(v) => updateEditorial("buttonUrl", v)}
              placeholder="e.g. /shop"
            />
          </div>

          <SaveButton
            onClick={() =>
              handleSaveSetting(
                "editorial_section",
                {
                  ...editorial,
                  paragraphs: editorial.paragraphs.filter(Boolean),
                },
                "Editorial Story"
              )
            }
            saving={saving}
            label="Save Editorial Story"
          />
        </div>
      )}

      {/* ── TAB 3: VALUE PILLARS ── */}
      {activeTab === "pillars" && (
        <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
          <TabHeader
            title="Storefront Value Pillars"
            description="The guarantees and craftsmanship pillars displayed at the bottom of the homepage"
            action={
              <button
                type="button"
                onClick={handleAddPillar}
                className="px-4 py-2 bg-[#121212] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9B783E] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Pillar
              </button>
            }
          />

          {pillars.length === 0 ? (
            /* Empty State */
            <div className="p-8 border border-dashed border-[#E8E5E0] bg-[#FAF8F5] text-center space-y-3">
              <p className="text-xs text-[#66635F]">
                No value pillars configured yet. Add your brand guarantees or shipping pillars.
              </p>
              <button
                type="button"
                onClick={handleAddPillar}
                className="px-4 py-2 border border-[#121212] text-xs uppercase tracking-wider font-semibold hover:bg-[#121212] hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Pillar
              </button>
            </div>
          ) : (
            /* Pillar Items List */
            <div className="space-y-6">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[#E8E5E0] bg-[#FAF8F5] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#121212]">
                      Pillar #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePillar(idx)}
                      className="text-xs text-[#8E8B85] hover:text-red-600 flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block uppercase tracking-wider font-semibold text-[#121212] mb-1">
                        Icon
                      </label>
                      <select
                        value={pillar.icon}
                        onChange={(e) => updatePillar(idx, "icon", e.target.value)}
                        className="w-full bg-white border border-[#E8E5E0] p-2.5 text-xs text-[#121212]"
                      >
                        {PILLAR_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <FormField
                      label="Title"
                      value={pillar.title}
                      onChange={(v) => updatePillar(idx, "title", v)}
                      placeholder="e.g. Artisanal Materials"
                      className="sm:col-span-2"
                    />

                    <FormField
                      label="Description"
                      value={pillar.description}
                      onChange={(v) => updatePillar(idx, "description", v)}
                      placeholder="e.g. Crafted from 100% natural fibers and tailored by family mills."
                      className="sm:col-span-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <SaveButton
            onClick={() => handleSaveSetting("value_pillars", pillars, "Value Pillars")}
            saving={saving}
            label="Save Value Pillars"
          >
            {pillars.length > 0 && (
              <button
                type="button"
                onClick={handleAddPillar}
                className="px-4 py-2 border border-[#E8E5E0] text-xs uppercase tracking-wider font-medium text-[#121212] hover:border-[#121212] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Pillar
              </button>
            )}
          </SaveButton>
        </div>
      )}

      {/* ── TAB 4: BANK TRANSFER DETAILS ── */}
      {activeTab === "bank" && (
        <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
          <TabHeader
            title="Official Wire Account Credentials"
            description="Shown to customers on the checkout screen when Bank Transfer is selected"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Account fields mapped from config */}
            {BANK_FIELDS.map(({ label, key, placeholder }) => (
              <FormField
                key={key}
                label={label}
                value={bank[key]}
                onChange={(v) => updateBank(key, v)}
                placeholder={placeholder}
              />
            ))}

            <FormField
              label="SWIFT / BIC Code (Optional)"
              value={bank.swiftCode}
              onChange={(v) => updateBank("swiftCode", v)}
              placeholder="e.g. SWIFT / BIC Code"
              className="sm:col-span-2"
            />

            <FormField
              label="Customer Remarks / Transfer Instructions"
              value={bank.instructions}
              onChange={(v) => updateBank("instructions", v)}
              rows={3}
              placeholder="e.g. Please include your Order Reference Number in the transfer remarks."
              className="sm:col-span-2"
            />
          </div>

          <SaveButton
            onClick={() => handleSaveSetting("bank_details", bank, "Bank Details")}
            saving={saving}
            label="Save Bank Wire Details"
          />
        </div>
      )}

      {/* ── TAB 5: ANNOUNCEMENT BAR ── */}
      {activeTab === "announcement" && (
        <div className="bg-white border border-[#E8E5E0] p-6 sm:p-8 space-y-6">
          <TabHeader
            title="Top Announcement Banner"
            description="Displayed across the very top of all storefront pages"
          />

          <div className="space-y-4 text-xs">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#E8E5E0]">
              <input
                type="checkbox"
                id="announcement-enabled"
                checked={announcement.enabled}
                onChange={(e) =>
                  setAnnouncement((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="w-4 h-4 accent-[#121212] cursor-pointer"
              />
              <label
                htmlFor="announcement-enabled"
                className="text-xs font-semibold uppercase tracking-wider text-[#121212] cursor-pointer"
              >
                Enable Announcement Bar on Storefront
              </label>
            </div>

            <FormField
              label="Announcement Text Message"
              value={announcement.message}
              onChange={(v) => setAnnouncement((prev) => ({ ...prev, message: v }))}
              placeholder="Enter announcement text message..."
            />

            <FormField
              label="Action Link Target"
              value={announcement.link}
              onChange={(v) => setAnnouncement((prev) => ({ ...prev, link: v }))}
              placeholder="e.g. /shop"
            />
          </div>

          <SaveButton
            onClick={() =>
              handleSaveSetting("announcement_bar", announcement, "Announcement Bar")
            }
            saving={saving}
            label="Save Announcement Banner"
          />
        </div>
      )}
    </div>
  );
}
