import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "legend_customer_session";
const SECRET_KEY = process.env.CUSTOMER_SESSION_SECRET || "legend_customer_lux_secret_key_2026";

if (process.env.NODE_ENV === "production" && !process.env.CUSTOMER_SESSION_SECRET) {
  console.warn("SECURITY WARNING: CUSTOMER_SESSION_SECRET is not explicitly set in environment variables!");
}

export interface CustomerSessionPayload {
  userId: string;
  email: string;
  name?: string | null;
  role: string;
  createdAt: number;
}

/**
 * Hash a plain text password using PBKDF2-SHA512 with a random salt (100,000 rounds)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const keyLength = 64;
  const digest = "sha512";
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
  return `${salt}:${iterations}:${hash}`;
}


/**
 * Verify a plain text password against a stored hash or legacy plaintext
 */
export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;

  // Support legacy or demo plaintext matching
  if (storedHash === password) return true;

  const parts = storedHash.split(":");
  if (parts.length !== 3) return false;

  const [salt, iterStr, originalHash] = parts;
  const iterations = parseInt(iterStr, 10);
  if (isNaN(iterations)) return false;

  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

/**
 * Sign a customer session token using HMAC-SHA256
 */
export function signCustomerToken(payload: CustomerSessionPayload): string {
  const dataString = JSON.stringify(payload);
  const base64Payload = Buffer.from(dataString).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(base64Payload)
    .digest("base64url");

  return `${base64Payload}.${signature}`;
}

/**
 * Verify and decode a customer session token
 */
export function verifyCustomerToken(token: string): CustomerSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(base64Payload)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const dataString = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload: CustomerSessionPayload = JSON.parse(dataString);

    // Expire after 30 days
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.createdAt > THIRTY_DAYS) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Set customer session cookie
 */
export async function setCustomerSessionCookie(payload: CustomerSessionPayload) {
  const token = signCustomerToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return token;
}

/**
 * Clear customer session cookie
 */
export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current customer session from cookies and verify database record
 */
export async function getCustomerSession() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const payload = verifyCustomerToken(cookie.value);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error retrieving customer session:", error);
    return null;
  }
}
