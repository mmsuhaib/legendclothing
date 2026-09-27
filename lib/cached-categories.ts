// Client-side in-memory request deduplication and caching for categories
let categoriesCache: any[] | null = null;
let pendingFetch: Promise<any[]> | null = null;

export async function getClientCategories(): Promise<any[]> {
  if (categoriesCache && categoriesCache.length > 0) {
    return categoriesCache;
  }
  if (!pendingFetch) {
    pendingFetch = fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          categoriesCache = data;
        }
        pendingFetch = null;
        return data;
      })
      .catch((err) => {
        console.error("Failed to fetch client categories", err);
        pendingFetch = null;
        return [];
      });
  }
  return pendingFetch;
}

export function invalidateClientCategories() {
  categoriesCache = null;
  pendingFetch = null;
}
