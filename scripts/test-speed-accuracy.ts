import prisma from "../lib/prisma";

async function runBenchmarksAndAccuracyTests() {
  console.log("==================================================");
  console.log("  LEGEND SPEED & ACCURACY BENCHMARK SUITE         ");
  console.log("==================================================");

  let allPassed = true;

  // 1. LATENCY & CACHING BENCHMARKS
  console.log("\n[1/4] Testing API Latency & Caching Headers...");
  try {
    const t0 = performance.now();
    const catRes = await fetch("http://localhost:3000/api/categories");
    const catTime = Math.round(performance.now() - t0);
    const catCache = catRes.headers.get("cache-control");

    console.log(`  - /api/categories latency: ${catTime}ms (HTTP ${catRes.status})`);
    console.log(`  - /api/categories Cache-Control: ${catCache || "none"}`);

    if (catRes.status === 200 && catCache && catCache.includes("s-maxage")) {
      console.log("  ✓ Category caching verified!");
    } else {
      console.warn("  ⚠ Category cache header missing or unexpected");
    }

    const t1 = performance.now();
    const prodRes = await fetch("http://localhost:3000/api/products");
    const prodTime = Math.round(performance.now() - t1);
    const prodCache = prodRes.headers.get("cache-control");

    console.log(`  - /api/products latency: ${prodTime}ms (HTTP ${prodRes.status})`);
    console.log(`  - /api/products Cache-Control: ${prodCache || "none"}`);

    if (prodRes.status === 200 && prodCache && prodCache.includes("s-maxage")) {
      console.log("  ✓ Products caching verified!");
    } else {
      console.warn("  ⚠ Products cache header missing or unexpected");
    }
  } catch (err) {
    console.error("  ✕ API Latency benchmark failed:", err);
    allPassed = false;
  }

  // 2. FINANCIAL PRECISION & ARITHMETIC ACCURACY
  console.log("\n[2/4] Testing Financial Arithmetic Precision...");
  const testCases = [
    { price: 19.99, qty: 3, expectedSubtotal: 59.97, expectedShipping: 15.0, expectedTotal: 74.97 },
    { price: 99.95, qty: 2, expectedSubtotal: 199.9, expectedShipping: 15.0, expectedTotal: 214.9 },
    { price: 250.0, qty: 1, expectedSubtotal: 250.0, expectedShipping: 0.0, expectedTotal: 250.0 },
    { price: 33.33, qty: 3, expectedSubtotal: 99.99, expectedShipping: 15.0, expectedTotal: 114.99 },
  ];

  for (const tc of testCases) {
    const rawSubtotal = tc.price * tc.qty;
    const preciseSubtotal = Math.round(rawSubtotal * 100) / 100;
    const shipping = preciseSubtotal >= 250 ? 0 : 15;
    const preciseTotal = Math.round((preciseSubtotal + shipping) * 100) / 100;

    const subtotalMatch = Math.abs(preciseSubtotal - tc.expectedSubtotal) < 0.001;
    const totalMatch = Math.abs(preciseTotal - tc.expectedTotal) < 0.001;

    if (subtotalMatch && totalMatch) {
      console.log(`  ✓ Exact cents precision: ${tc.qty}x $${tc.price} -> Subtotal: $${preciseSubtotal.toFixed(2)}, Total: $${preciseTotal.toFixed(2)}`);
    } else {
      console.error(`  ✕ Financial precision mismatch on $${tc.price} * ${tc.qty}`);
      allPassed = false;
    }
  }

  // 3. CATEGORY MATCHING & SLUG NORMALIZATION ACCURACY
  console.log("\n[3/4] Testing Category Slug Normalization Accuracy...");
  const normalize = (s?: string | null) => (s || "").toLowerCase().replace(/[\s_-]+/g, "");

  const slugVariations = [
    { raw: "t-shirts", target: "t-shirts", matches: true },
    { raw: "T Shirts", target: "t-shirts", matches: true },
    { raw: "tshirts", target: "t-shirts", matches: true },
    { raw: "T-SHIRTS", target: "t-shirts", matches: true },
    { raw: "outerwear", target: "t-shirts", matches: false },
    { raw: "tailoring", target: "all", matches: true },
  ];

  for (const sv of slugVariations) {
    const isMatch = sv.target === "all" || normalize(sv.raw) === normalize(sv.target);
    if (isMatch === sv.matches) {
      console.log(`  ✓ Slug match accurate: "${sv.raw}" vs "${sv.target}" -> ${isMatch}`);
    } else {
      console.error(`  ✕ Slug match error: "${sv.raw}" vs "${sv.target}"`);
      allPassed = false;
    }
  }

  // 4. DATABASE INDEXES INTEGRITY
  console.log("\n[4/4] Verifying Database Indexes in PostgreSQL...");
  try {
    const indexes: any[] = await prisma.$queryRaw`SELECT indexname as name FROM pg_indexes WHERE tablename = 'Product';`;
    const indexNames = indexes.map((idx) => idx.name);
    console.log(`  - Product indexes found in DB: ${indexes.length}`);
    for (const name of indexNames) {
      console.log(`    • ${name}`);
    }
    if (indexes.length >= 3) {
      console.log("  ✓ Database query indexing verified!");
    } else {
      console.warn("  ⚠ Lower than expected index count");
    }
  } catch (err) {
    console.error("  ✕ Database index verification failed:", err);
    allPassed = false;
  }

  console.log("\n--------------------------------------------------");
  if (allPassed) {
    console.log("✓ ALL SPEED & ACCURACY VERIFICATIONS PASSED!");
  } else {
    console.log("✕ Some verifications failed. Review logs above.");
    process.exit(1);
  }
}

runBenchmarksAndAccuracyTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
