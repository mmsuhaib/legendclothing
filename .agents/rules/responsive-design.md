# Responsive Design Rule for LEGEND Application

## Rule Summary
Every component, page, drawer, modal, and data table created or modified in this repository MUST be 100% responsive across mobile (`320px–640px`), tablet (`640px–1024px`), desktop (`1024px–1440px`), and ultra-wide screens (`1440px+`).

### Strict Requirements:
1. **Zero Horizontal Scroll**:
   - Never use un-prefixed fixed widths (`w-[...px]`) that exceed 320px.
   - Modals and drawers must use `w-full max-w-md` or `max-w-lg` with viewport bounds (`p-4`).

2. **Mobile Touch Ergonomics**:
   - Interactive touch targets must maintain at least 44×44px hit area or minimum touch padding.
   - Fixed mobile navigation must incorporate safe-area insets (`env(safe-area-inset-bottom)`).
   - The `<main>` element must maintain bottom clearance (`pb-16 lg:pb-0`) to avoid collision with the mobile bottom navigation.

3. **Responsive Product Grids**:
   - Storefront catalogs must render 2 columns on mobile devices (`grid-cols-2`), adapting to 3 or 4 columns on tablet and desktop (`md:grid-cols-3 lg:grid-cols-4`).

4. **Data Tables**:
   - All tables in the admin portal must be wrapped in `<div className="overflow-x-auto">`.
   - Toolbars and filter controls must stack vertically on mobile (`flex-col sm:flex-row`).

5. **Responsive Media**:
   - Next.js `<Image>` components must include responsive `sizes` definitions matching their layout columns.
