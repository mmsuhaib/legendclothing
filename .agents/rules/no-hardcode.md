# Zero Hardcoding Rule for LEGEND Application

## Rule Summary
All application data, categories, catalog items, pricing boundaries, banners, and search suggestions MUST be dynamically loaded from the database or API. No static fallback arrays or hardcoded magic values are permitted.

### Specific Requirements:
1. **Categories**:
   - MUST be fetched from `/api/categories` or SSR Prisma queries.
   - Never define static category fallback arrays (e.g. `DEFAULT_CATEGORIES` or `INITIAL_CATEGORIES`).
   - Initial state for categories must always be `[]`.

2. **Catalog Filters & Bounds**:
   - Price boundaries must be dynamically computed via `Math.max()` from loaded product data.
   - Never hardcode fixed price ceilings like `priceRange = 500`.
   - Default filter state for price must be `null` so products are never hidden on initial load.

3. **Search & Discovery**:
   - Search suggestions, tags, and category pills must be dynamically populated from live database records.

4. **Branding & CMS**:
   - Hero copy, announcements, value pillars, and banking details must be stored in the database (`SiteSetting` table) and loaded via `/api/cms`.
