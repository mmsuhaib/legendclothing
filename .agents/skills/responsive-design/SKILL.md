---
name: responsive-design
description: >-
  Audits, implements, and enforces flawless mobile-first and desktop-responsive layouts,
  fluid typography, touch ergonomics (44px min targets), dynamic grid adaptations,
  mobile navigation drawers, safe-area-insets, and zero horizontal scroll overflow across
  all screen sizes (320px mobile to 4K ultra-wide).
---

# Responsive Design & Mobile-First Architecture Skill

This skill establishes the comprehensive standards, procedures, and architectural patterns required to deliver pixel-perfect, fluid, and ergonomically responsive experiences across all mobile devices, tablets, laptops, and ultra-wide desktop monitors.

---

## 1. Breakpoint Grid Matrix

| Device Class | Viewport Range | Layout Pattern | Grid Columns | Navigation Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Small** | `320px – 380px` | Single column or compact 2-col | 1 or 2 cols (`gap-3`) | Mobile Bottom Nav + Hamburger Drawer |
| **Mobile Standard** | `380px – 640px` | 2-column product catalog | 2 cols (`gap-4`) | Mobile Bottom Nav + Hamburger Drawer |
| **Tablet** | `640px – 1024px` | Hybrid grid with collapsible filters | 2–3 cols (`gap-6`) | Top header + mobile drawer / bottom bar |
| **Desktop** | `1024px – 1440px` | Persistent sidebar + 3-col catalog | 3–4 cols (`gap-6`) | Full desktop nav + hover mega dropdowns |
| **Ultra-Wide** | `1440px+` | Constrained container (`max-w-7xl`) | 4 cols (`gap-8`) | Full desktop nav, centered luxury canvas |

---

## 2. Core Responsive Principles

### A. Touch Ergonomics (Mobile-First)
1. **Minimum Touch Target**:
   - Interactive elements (buttons, pill filters, links, quantity incrementers) must have at least **44×44px** hit area (or minimum `py-2 px-3` with tap margin).
2. **Safe-Area Inset Handling**:
   - Fixed bars (Announcement Bar, Bottom Navigation) must respect modern mobile hardware insets:
     ```css
     padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
     ```
3. **Content Clearance for Mobile Bottom Nav**:
   - Layout `<main>` must include bottom clearance on mobile to prevent floating navigation overlap:
     ```tsx
     <main className="flex-1 pb-16 lg:pb-0">{children}</main>
     ```
4. **Horizontal Scroll Containers**:
   - Horizontal pill bars (category tabs, tag selectors) must allow momentum finger scrolling without breaking the layout:
     ```tsx
     <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none -webkit-overflow-scrolling-touch">
     ```

### B. Viewport Integrity & Zero Horizontal Scroll
1. **No Fixed Width Traps**:
   - Never write fixed width classes like `w-[500px]` or `min-w-[600px]` without responsive prefixes (`w-full md:w-[500px]`).
   - Dialogs and modals must use `w-full max-w-md mx-4` so they gracefully shrink on compact screens.
2. **Fluid Typography**:
   - Headings must scale gracefully:
     ```tsx
     <h1 className="text-2xl sm:text-3xl lg:text-5xl font-light tracking-wide">
     ```
3. **Body Overflow Prevention**:
   - Ensure the root layout or body prevents unintentional horizontal overflow while allowing vertical document scroll:
     ```css
     overflow-x: hidden;
     ```

### C. Image Responsiveness
1. **Next.js `<Image>` Configuration**:
   - Responsive images must always specify descriptive `sizes`:
     ```tsx
     sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
     ```
   - Always maintain consistent aspect ratios with `fill` and `object-cover` inside relative containers:
     ```tsx
     <div className="relative aspect-[3/4] w-full overflow-hidden">
       <Image src={url} alt={name} fill className="object-cover" />
     </div>
     ```

### D. Admin Tables & Complex Layouts
1. **Table Horizontal Containment**:
   - Every tabular view (Orders, Products, Inventory, Users) must be wrapped in a scroll container:
     ```tsx
     <div className="overflow-x-auto">
       <table className="w-full text-left text-xs">...</table>
     </div>
     ```
2. **Action Toolbars**:
   - Stack toolbar controls vertically on mobile and horizontally on larger screens:
     ```tsx
     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
     ```

---

## 3. Step-by-Step Responsive Audit Procedure

### Step 1: Run the Automated Responsive Audit
```bash
npx tsx scripts/audit-responsive.ts
```

### Step 2: Test Breakpoint Simulators
Simulate rendering at the three critical device widths:
- **Mobile Compact**: `375px × 667px` (iPhone SE)
- **Tablet**: `768px × 1024px` (iPad)
- **Standard Desktop**: `1440px × 900px` (MacBook / Desktop)

### Step 3: Verify Interactive Overlay Drawers
1. Open Hamburger Menu on mobile -> Ensure backdrop blurs, closes on route navigation or ESC.
2. Open Cart Drawer on mobile -> Ensure full width `w-full sm:max-w-md`, scrollable items list, and sticky checkout button.
3. Open Filter Bottom Sheet -> Ensure filters scroll smoothly without cutting off action buttons.

### Step 4: Validate Touch Targets
- Ensure buttons have adequate touch padding (`min-h-[38px]` or `min-h-[44px]`).
- Check that close (`X`) buttons on modals are easily tappable.
