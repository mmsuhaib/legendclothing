import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirect = url.searchParams.get("redirect") || "/";

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Determine origin: use the active request origin in development so localhost works seamlessly,
  // or NEXT_PUBLIC_APP_URL in production.
  const origin =
    process.env.NODE_ENV === "development"
      ? url.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || url.origin || "http://localhost:3000";

  const redirectUri = `${origin}/api/auth/google/callback`;

  // If Google Client ID is not configured yet, redirect with helpful query param or test mode
  if (!clientId || clientId.trim() === "" || clientId.includes("your-google-client-id")) {
    // Redirect to the login page with a notice or directly login demo user in development
    if (process.env.NODE_ENV !== "production") {
      // In dev mode when credentials aren't set yet, allow seamless fallback
      return NextResponse.redirect(
        new URL(
          `${redirectUri}?demo=true&state=${encodeURIComponent(
            JSON.stringify({ returnTo: redirect })
          )}`,
          url.origin
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Google Login is not configured yet. Please set GOOGLE_CLIENT_ID in your .env file."
        )}&redirect=${encodeURIComponent(redirect)}`,
        url.origin
      )
    );
  }

  // State encodes destination URL
  const state = Buffer.from(JSON.stringify({ returnTo: redirect })).toString("base64url");

  // Build Google OAuth 2.0 URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
