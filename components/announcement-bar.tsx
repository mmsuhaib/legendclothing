"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<{
    enabled: boolean;
    message: string;
    link?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/cms")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcement_bar) {
          setAnnouncement(data.announcement_bar);
        }
      })
      .catch(() => { });
  }, []);

  if (pathname.startsWith("/admin") || !announcement || !announcement.enabled || !announcement.message) {
    return null;
  }

  // Create duplicate instances for seamless 360-degree running marquee loop
  const tickerItems = [1, 2, 3, 4];

  return (
    <aside
      aria-label="Store Announcement"
      className="relative bg-[#0C0C0C] text-[#FAF8F5] border-b border-[#24221E]/90 overflow-hidden select-none py-2.5 z-40 group"
    >
      {/* Soft gradient edge masks for luxury fade-in/fade-out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#0C0C0C] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#0C0C0C] to-transparent z-10" />

      {/* Screen-reader accessible version */}
      <span className="sr-only">{announcement.message}</span>

      {/* Hardware-accelerated continuous running marquee */}
      <div
        className="animate-marquee-running flex items-center whitespace-nowrap will-change-transform subpixel-antialiased select-none"
        aria-hidden="true"
      >
        {/* Sequence 1 */}
        <div className="flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
          {tickerItems.map((idx) => (
            <div key={`seq1-${idx}`} className="flex items-center gap-3 sm:gap-4 shrink-0">
              <span className="text-xs sm:text-[13px] font-medium tracking-wide text-[#F3F0E6] flex items-center gap-1.5">
                {announcement.message}
              </span>

              {announcement.link && (
                <Link
                  href={announcement.link}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#D4AF37] hover:text-[#FAF8F5] bg-[#1A1815] hover:bg-[#2A2620] border border-[#D4AF37]/40 hover:border-[#D4AF37] px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer shrink-0 group/cta shadow-xs"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover/cta:translate-x-0.5 transition-transform duration-200" />
                </Link>
              )}

              <span className="text-[#9B783E]/60 text-xs select-none pl-2">✦</span>
            </div>
          ))}
        </div>

        {/* Sequence 2 (Identical mirror for seamless infinite looping without jump) */}
        <div className="flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
          {tickerItems.map((idx) => (
            <div key={`seq2-${idx}`} className="flex items-center gap-3 sm:gap-4 shrink-0">
              <span className="text-xs sm:text-[13px] font-medium tracking-wide text-[#F3F0E6] flex items-center gap-1.5">
                {announcement.message}
              </span>

              {announcement.link && (
                <Link
                  href={announcement.link}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#D4AF37] hover:text-[#FAF8F5] bg-[#1A1815] hover:bg-[#2A2620] border border-[#D4AF37]/40 hover:border-[#D4AF37] px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer shrink-0 group/cta shadow-xs"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover/cta:translate-x-0.5 transition-transform duration-200" />
                </Link>
              )}

              <span className="text-[#9B783E]/60 text-xs select-none pl-2">✦</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
