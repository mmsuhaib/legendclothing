import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getAdminSession } from "@/lib/admin-auth";

const ALLOWED_TYPES = [
  "receipts",
  "products",
  "categories",
  "cms",
  "banners",
  "general",
] as const;
type UploadType = typeof ALLOWED_TYPES[number];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawType = (formData.get("type") as string) || "general";

    // Normalize and sanitize upload type
    let normalizedType = rawType.toLowerCase().trim();
    if (normalizedType === "product") normalizedType = "products";
    if (normalizedType === "category") normalizedType = "categories";
    if (normalizedType === "receipt") normalizedType = "receipts";
    if (normalizedType === "banner") normalizedType = "banners";

    if (!ALLOWED_TYPES.includes(normalizedType as UploadType)) {
      normalizedType = "general";
    }
    const type = normalizedType as UploadType;

    // Administrative uploads (catalog products, categories, cms, banners) require an authenticated admin session
    const adminTypes: UploadType[] = ["products", "categories", "cms", "banners"];
    if (adminTypes.includes(type)) {
      const admin = await getAdminSession();
      if (!admin && process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Unauthorized: Admin session required to upload this asset." },
          { status: 403 }
        );
      }
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Supported formats check: full support for PNG, JPG, JPEG, WEBP, AVIF, SVG, GIF, PDF
    const allowedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".svg",
      ".gif",
      ".pdf",
    ];
    const ext = path.extname(file.name || "").toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, JPEG, WEBP, AVIF, SVG, and PDF files are supported" },
        { status: 400 }
      );
    }

    // File size check: 10MB max
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cryptographically random unique filename
    const cleanBase = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 20);
    const uniqueFileName = `${cleanBase}_${crypto.randomUUID().slice(0, 8)}_${Date.now()}${ext}`;

    const baseUploadDir = path.resolve(process.cwd(), "public", "uploads");
    const targetDir = path.resolve(baseUploadDir, type);

    // Double check that target directory stays within base uploads directory
    if (!targetDir.startsWith(baseUploadDir)) {
      return NextResponse.json({ error: "Invalid destination path" }, { status: 400 });
    }

    await mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${type}/${uniqueFileName}`;

    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".svg": "image/svg+xml",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
    };

    return NextResponse.json({
      url: publicUrl,
      fileName: file.name,
      fileType: file.type || mimeTypes[ext] || "image/png",
      fileSize: file.size,
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
