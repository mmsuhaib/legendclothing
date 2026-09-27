---
name: remove-hardcode
description: >-
  Audits, refactors, and eliminates hardcoded application data (mock products, phantom categories,
  fixed price ranges, static search suggestions, hardcoded brand copy) across the entire application.
  Enforces dynamic, database-driven architecture using Prisma ORM, live API endpoints, and dynamic calculations.
---

# Remove Hardcode & Dynamic Data Architecture Skill

This skill guides you through auditing and refactoring any hardcoded constants, mock arrays, or static fallbacks into dynamic, database-backed architectures.

---

## Core Principles

1. **Zero Phantom Categories**:
   - Never define static category lists (e.g. `const DEFAULT_CATEGORIES = [...]` or `INITIAL_CATEGORIES`).
   - Categories must always be fetched from the database via `/api/categories` or SSR Prisma queries.
   - Initial state in client components must always be empty (`[]`).

2. **No Arbitrary Numeric Ceilings**:
   - Never hardcode fixed price bounds (e.g. `priceRange = 500`, `max = 500`).
   - Max price limits must always be dynamically calculated from the catalog data:
     ```tsx
     const maxCatalogPrice = useMemo(() => {
       if (products.length === 0) return 10000;
       const maxP = Math.max(...products.map((p) => p.price || 0));
       return Math.max(Math.ceil(maxP / 500) * 500, 1000);
     }, [products]);
     ```
   - Filters must only apply if explicitly set by the user (`priceRange !== null`).

3. **Dynamic Search & Autocomplete Suggestions**:
   - Never hardcode static search terms (e.g. `["Oxford Overshirt", "LEGEND Nº 01"]`).
   - Suggestions must be dynamically derived from active categories or live product records.

4. **Dynamic Site Settings & Brand Messaging**:
   - Hero content, editorial stories, announcement banners, and wire transfer bank details must reside in the `SiteSetting` / `Banner` tables in SQLite/PostgreSQL, editable via `/admin/cms`.
   - Components must read from `/api/cms` or server-side Prisma settings queries.

5. **Flexible Slug Normalization**:
   - Normalizing slugs (`toLowerCase().replace(/[\s_-]+/g, "")`) ensures that query parameters like `t-shirts`, `t shirts`, `tshirts` consistently resolve to the correct category without breaking.

---

## Step-by-Step Refactoring Procedure

### Step 1: Run the Hardcode Audit Script
Execute the workspace audit script to identify any hardcoded mock data, fallback categories, or static arrays:
```bash
npx tsx scripts/audit-hardcode.ts
```

### Step 2: Refactor Component State
- Replace static default arrays with empty arrays:
  ```diff
  - const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  + const [categories, setCategories] = useState<Category[]>([]);
  ```
- Ensure an asynchronous `useEffect` queries `/api/categories` or relevant API on mount.

### Step 3: Remove Numeric Constraints in Filters
- Ensure ranges (price, stock) dynamically adapt to the data loaded:
  ```diff
  - const [priceRange, setPriceRange] = useState<number>(500);
  + const [priceRange, setPriceRange] = useState<number | null>(null);
  ```

### Step 4: Validate Database & Seed Sync
- Ensure database seed scripts ([prisma/seed.ts](file:///c:/Users/DELL/Desktop/legend/prisma/seed.ts)) match actual storefront taxonomy.
- Ensure all admin CRUD routes cascade cleanly using Prisma transactions.

### Step 5: Verify Type Safety & Routes
- Run `npx tsc --noEmit`.
- Verify storefront routes (`/`, `/shop`, `/shop?category=...`) respond with HTTP 200.
