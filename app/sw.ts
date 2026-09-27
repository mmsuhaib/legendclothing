import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  NetworkOnly,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// List of strictly sensitive routes that must NEVER be cached or served offline
const SENSITIVE_PATHS = [
  "/checkout",
  "/cart",
  "/account",
  "/admin",
  "/login",
  "/register",
  "/orders",
  "/api/checkout",
  "/api/cart",
  "/api/payment",
  "/api/auth",
  "/api/user",
  "/api/account",
  "/api/orders",
  "/api/stock",
  "/api/price",
  "/api/admin",
];

const isSensitiveRequest = (url: URL): boolean => {
  return SENSITIVE_PATHS.some((path) => url.pathname.startsWith(path));
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. Strict NetworkOnly for sensitive operations (Checkout, Payment, Cart, Auth, Stock, etc.)
    {
      matcher({ url }) {
        return isSensitiveRequest(url);
      },
      handler: new NetworkOnly(),
    },

    // 2. Next.js Static JavaScript & CSS chunks (immutable build hashes)
    {
      matcher({ url, request }) {
        return (
          url.pathname.startsWith("/_next/static/") ||
          request.destination === "style" ||
          request.destination === "script"
        );
      },
      handler: new CacheFirst({
        cacheName: "legend-static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },

    // 3. Brand Assets & Icons (Network-First to always show newest logo immediately)
    {
      matcher({ url }) {
        return (
          url.pathname === "/logo.png" ||
          url.pathname === "/logo-white.png" ||
          url.pathname === "/icon.png" ||
          url.pathname === "/favicon.ico" ||
          url.pathname === "/manifest.json" ||
          url.pathname === "/manifest.webmanifest"
        );
      },
      handler: new NetworkFirst({
        cacheName: "legend-brand-assets",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 24 * 60 * 60, // 1 Day
          }),
        ],
      }),
    },

    // 4. Product & UI Images (Unsplash, local uploads, Next.js optimized images)
    {
      matcher({ request, url }) {
        return (
          request.destination === "image" ||
          url.pathname.startsWith("/_next/image") ||
          url.pathname.startsWith("/uploads/") ||
          url.hostname.includes("images.unsplash.com") ||
          /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i.test(url.pathname)
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "legend-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 14 * 24 * 60 * 60, // 14 Days
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },

    // 4. Web Fonts
    {
      matcher({ request, url }) {
        return (
          request.destination === "font" ||
          /\.(?:woff|woff2|ttf|otf|eot)$/i.test(url.pathname) ||
          url.hostname.includes("fonts.gstatic.com")
        );
      },
      handler: new CacheFirst({
        cacheName: "legend-fonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Year
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },

    // 5. Public Product & Catalog APIs (safe to read offline if already visited)
    {
      matcher({ url }) {
        return (
          url.pathname.startsWith("/api/products") ||
          url.pathname.startsWith("/api/categories") ||
          url.pathname.startsWith("/api/cms")
        );
      },
      handler: new NetworkFirst({
        cacheName: "legend-catalog-api",
        networkTimeoutSeconds: 4,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 Day
          }),
        ],
      }),
    },

    // 6. Navigation / HTML Document requests (Network-first with offline fallback)
    {
      matcher({ request, url }) {
        return request.destination === "document" && !isSensitiveRequest(url);
      },
      handler: new NetworkFirst({
        cacheName: "legend-pages",
        networkTimeoutSeconds: 4,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
          }),
        ],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
