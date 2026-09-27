import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "legend_admin_session";
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || "legend_secret_lux_admin_portal_key_2026";

if (process.env.NODE_ENV === "production" && !process.env.ADMIN_SESSION_SECRET) {
  console.warn("SECURITY WARNING: ADMIN_SESSION_SECRET is not explicitly set in environment variables!");
}

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
}

/**
 * Hash an admin password using PBKDF2-SHA512 with a cryptographically secure random salt
 */
export function hashAdminPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const keyLength = 64;
  const digest = "sha512";
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return `${salt}:${iterations}:${hash}`;
}

/**
 * Verify an admin password against a stored PBKDF2 hash or legacy plaintext record
 */
export function verifyAdminPassword(
  password: string,
  storedHash: string | null | undefined
): { isValid: boolean; needsRehash: boolean } {
  if (!storedHash) return { isValid: false, needsRehash: false };

  // Support transparent legacy plaintext upgrade
  if (storedHash === password) {
    return { isValid: true, needsRehash: true };
  }

  const parts = storedHash.split(":");
  if (parts.length !== 3) return { isValid: false, needsRehash: false };

  const [salt, iterStr, originalHash] = parts;
  const iterations = parseInt(iterStr, 10);
  if (isNaN(iterations)) return { isValid: false, needsRehash: false };

  try {
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
    const hashBuffer = Buffer.from(hash, "hex");
    const origBuffer = Buffer.from(originalHash, "hex");

    if (hashBuffer.length !== origBuffer.length) {
      return { isValid: false, needsRehash: false };
    }

    const isValid = crypto.timingSafeEqual(hashBuffer, origBuffer);
    return { isValid, needsRehash: iterations < 100000 };
  } catch {
    return { isValid: false, needsRehash: false };
  }
}

/**
 * Sign an admin session token using HMAC-SHA256
 */
export function signAdminToken(payload: AdminSessionPayload): string {
  const dataString = JSON.stringify(payload);
  const base64Payload = Buffer.from(dataString).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(base64Payload)
    .digest("base64url");

  return `${base64Payload}.${signature}`;
}

/**
 * Verify and decode an admin session token
 */
export function verifyAdminToken(token: string): AdminSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(base64Payload)
      .digest("base64url");

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const dataString = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload: AdminSessionPayload = JSON.parse(dataString);

    // Expire after 7 days (in ms)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.createdAt > SEVEN_DAYS) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Set the admin session cookie on request response
 */
export async function setAdminSessionCookie(payload: AdminSessionPayload) {
  const token = signAdminToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

/**
 * Clear the admin session cookie
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current admin session from request cookies and verify database record
 */
export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const payload = verifyAdminToken(cookie.value);
    if (!payload) return null;

    // Verify user still exists in database
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
      select: { id: true, email: true, name: true, role: true },
    });

    return admin;
  } catch (error) {
    console.error("Error retrieving admin session:", error);
    return null;
  }
}

/**
 * Enforce admin authentication helper: returns admin or null
 */
export async function requireAdminSession() {
  const admin = await getAdminSession();
  if (!admin) {
    return null;
  }
  return admin;
}

