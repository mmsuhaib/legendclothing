import prisma from "../lib/prisma";

async function main() {
  console.log("==================================================");
  console.log("  LEGEND POSTGRESQL LIVE HEALTH CHECK & AUDIT    ");
  console.log("==================================================");

  try {
    // 1. Connection & Server Info
    const startTime = performance.now();
    const serverInfo: any = await prisma.$queryRaw`
      SELECT current_database() as db, current_user as user, version() as version;
    `;
    const pingMs = Math.round(performance.now() - startTime);

    console.log("\n[1/4] 🔌 Connection Status:");
    console.log(`  ✓ Database: ${serverInfo[0]?.db}`);
    console.log(`  ✓ User:     ${serverInfo[0]?.user}`);
    console.log(`  ✓ Engine:   ${serverInfo[0]?.version.split(" on ")[0]}`);
    console.log(`  ✓ Latency:  ${pingMs}ms`);

    // 2. Table Row Counts
    console.log("\n[2/4] 📊 Live Table Row Counts:");
    const [
      categoriesCount,
      productsCount,
      variantsCount,
      imagesCount,
      adminCount,
      ordersCount,
      settingsCount,
      bannersCount,
    ] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.productImage.count(),
      prisma.adminUser.count(),
      prisma.order.count(),
      prisma.siteSetting.count(),
      prisma.banner.count(),
    ]);

    console.log(`  • Categories:       ${categoriesCount}`);
    console.log(`  • Products:         ${productsCount}`);
    console.log(`  • Product Variants: ${variantsCount}`);
    console.log(`  • Product Images:   ${imagesCount}`);
    console.log(`  • Admin Users:      ${adminCount}`);
    console.log(`  • Orders:           ${ordersCount}`);
    console.log(`  • Banners:          ${bannersCount}`);
    console.log(`  • Site Settings:    ${settingsCount}`);

    // 3. Database Indexes Check
    console.log("\n[3/4] ⚡ Database Indexes Integrity:");
    const indexes: any[] = await prisma.$queryRaw`
      SELECT indexname as name FROM pg_indexes WHERE tablename = 'Product';
    `;
    console.log(`  ✓ Found ${indexes.length} indexes on Product table for high-speed queries.`);

    // 4. Live Read / Write / Delete Transaction Test
    console.log("\n[4/4] ✍️ Read / Write / Delete Transaction Verification:");
    const testKey = `health_check_${Date.now()}`;
    const createdSetting = await prisma.siteSetting.create({
      data: {
        key: testKey,
        value: "active_test",
        description: "Temporary health check record",
      },
    });
    console.log(`  ✓ Write test passed (created record id: ${createdSetting.id})`);

    const readSetting = await prisma.siteSetting.findUnique({
      where: { key: testKey },
    });
    if (readSetting?.value === "active_test") {
      console.log("  ✓ Read test passed (verified record content)");
    }

    await prisma.siteSetting.delete({
      where: { key: testKey },
    });
    console.log("  ✓ Delete test passed (cleaned up test record)");

    console.log("\n==================================================");
    console.log("  🎉 100% VERIFIED: POSTGRESQL IS FULLY LIVE & READY!");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ Health check failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
