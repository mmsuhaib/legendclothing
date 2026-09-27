import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setCustomerSessionCookie } from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, credential } = body;

    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      return NextResponse.json(
        { error: "Missing Google ID token or credential" },
        { status: 400 }
      );
    }

    // Verify token with Google's tokeninfo API
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenToVerify)}`
    );

    if (!googleRes.ok) {
      return NextResponse.json(
        { error: "Invalid or expired Google token" },
        { status: 401 }
      );
    }

    const payload = await googleRes.json();
    const email = payload.email?.trim().toLowerCase();
    const name = payload.name || payload.given_name || email?.split("@")[0];

    // Enforce Token Audience (aud) validation to prevent token substitution attacks
    const expectedClientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (expectedClientId && payload.aud !== expectedClientId) {
      return NextResponse.json(
        { error: "Unauthorized: Token audience mismatch." },
        { status: 401 }
      );
    }

    // Verify email address is verified by Google
    if (payload.email_verified !== "true" && payload.email_verified !== true) {
      return NextResponse.json(
        { error: "Google account email is not verified." },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "No email address found in Google token" },
        { status: 400 }
      );
    }


    // Find or create customer user in Prisma
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
      },
      create: {
        email,
        name,
        role: "customer",
      },
    });

    // Set signed customer session cookie
    await setCustomerSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Google verify token error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify Google login" },
      { status: 500 }
    );
  }
}
