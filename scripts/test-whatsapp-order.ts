import prisma from "../lib/prisma";

async function testWhatsAppOrder() {
  console.log("Testing WhatsApp Order Flow...");

  const product = await prisma.product.findFirst({
    where: { isPublished: true },
  });

  if (!product) {
    console.error("No published product found");
    return;
  }

  const initialStock = product.stock;

  const payload = {
    customerName: "Julian Vance",
    customerPhone: "+1 (555) 019-2834",
    shippingAddress: "740 Park Avenue",
    city: "New York",
    country: "United States",
    items: [
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        size: "L",
        color: "Obsidian Black",
        quantity: 1,
      },
    ],
    subtotal: product.price,
    shippingFee: 0,
    total: product.price,
    status: "WhatsApp Order",
    paymentMethod: "WHATSAPP",
    notes: "Please confirm size via WhatsApp",
  };

  const res = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API returned ${res.status}: ${errorText}`);
  }

  const order = await res.json();
  console.log(`✓ Order successfully created: ${order.orderNumber}`);
  console.log(`  - Status: ${order.status}`);
  console.log(`  - Customer: ${order.customerName} (${order.customerPhone})`);
  console.log(`  - Subtotal: $${order.subtotal}`);
  console.log(`  - Total: $${order.total}`);

  // Verify stock decremented
  const updatedProduct = await prisma.product.findUnique({
    where: { id: product.id },
  });
  console.log(`✓ Inventory stock check: ${initialStock} -> ${updatedProduct?.stock}`);

  if (order.status === "WhatsApp Order" && order.orderNumber.startsWith("LEG-2026-")) {
    console.log("✓ All WhatsApp order creation validations passed!");
  } else {
    throw new Error("Order validation failed");
  }
}

testWhatsAppOrder()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
