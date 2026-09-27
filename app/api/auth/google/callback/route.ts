import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setCustomerSessionCookie } from "@/lib/customer-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const isDemo = url.searchParams.get("demo") === "true";

  // Sanitize returnTo to strictly prevent Open Redirects
  function sanitizeReturnTo(target: string | undefined | null): string {
    if (!target || typeof target !== "string") return "/";
    const trimmed = target.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
      return trimmed;
    }
    return "/";
  }

  // Decode destination URL from state
  let returnTo = "/";
  if (stateParam) {
    try {
      const decodedState = JSON.parse(
        Buffer.from(stateParam, "base64url").toString("utf-8")
      );
      if (decodedState?.returnTo && typeof decodedState.returnTo === "string") {
        returnTo = sanitizeReturnTo(decodedState.returnTo);
      }
    } catch {
      returnTo = "/";
    }
  }


  // Handle errors from Google consent screen
  if (error) {
    console.error("Google OAuth error:", error);
    const redirectUrl = new URL(
      `/login?error=${encodeURIComponent(
        `Google authorization was cancelled or failed: ${error}`
      )}&redirect=${encodeURIComponent(returnTo)}`,
      url.origin
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Handle local development demo mode if Google credentials are not yet set
  if (isDemo && process.env.NODE_ENV !== "production") {
    try {
      const demoEmail = "google.client@legendmaison.com";
      const demoName = "Julian Vance (Google)";

      const user = await prisma.user.upsert({
        where: { email: demoEmail },
        update: { name: demoName },
        create: {
          email: demoEmail,
          name: demoName,
          role: "customer",
        },
      });

      await setCustomerSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: Date.now(),
      });

      return NextResponse.redirect(new URL(returnTo, url.origin));
    } catch (demoErr) {
      console.error("Failed demo google login:", demoErr);
      return NextResponse.redirect(new URL("/login?error=Demo+login+failed", url.origin));
    }
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=No+authorization+code+provided`, url.origin)
    );
  }

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    url.origin ||
    "http://localhost:3000";
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Missing Google OAuth Client Secret in .env configuration."
        )}&redirect=${encodeURIComponent(returnTo)}`,
        url.origin
      )
    );
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const tokenErr = await tokenResponse.text();
      console.error("Token exchange failed:", tokenErr);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Failed to exchange token with Google.")}&redirect=${encodeURIComponent(returnTo)}`,
          url.origin
        )
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Failed to fetch profile from Google.")}&redirect=${encodeURIComponent(returnTo)}`,
          url.origin
        )
      );
    }

    const profile = await profileResponse.json();
    const email = profile.email?.trim().toLowerCase();
    const name = profile.name || profile.given_name || email.split("@")[0];

    if (!email) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("No email returned by Google account.")}&redirect=${encodeURIComponent(returnTo)}`,
          url.origin
        )
      );
    }

    // 3. Find or create user in Prisma DB
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

    // 4. Issue customer session cookie
    await setCustomerSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: Date.now(),
    });

    // 5. Redirect back to client's intended destination
    return NextResponse.redirect(new URL(returnTo, url.origin));
  } catch (err: any) {
    console.error("Google Callback Error:", err);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Authentication error occurred. Please try again.")}&redirect=${encodeURIComponent(returnTo)}`,
        url.origin
      )
    );
  }
}
