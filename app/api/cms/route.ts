import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, any> = {};

    for (const s of settings) {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    }

    // Ensure default announcement is updated to the active special offer if currently unset or on old shipping template
    const currentAnnouncement = settingsMap["announcement_bar"];
    const specialOfferAnnouncement = {
      enabled: true,
      message: "🔥 LEGEND Special Offer: 👔 Shirts Rs. 2,500 | 👕 T-Shirts Rs. 1,500 — Visit our outlet today and grab yours before they’re gone!",
      link: "/shop",
    };

    if (
      !currentAnnouncement ||
      (typeof currentAnnouncement.message === "string" &&
        currentAnnouncement.message.includes("COMPLIMENTARY EXPRESS WORLDWIDE SHIPPING"))
    ) {
      await prisma.siteSetting.upsert({
        where: { key: "announcement_bar" },
        update: {
          value: JSON.stringify(specialOfferAnnouncement),
          description: "Top announcement banner",
        },
        create: {
          key: "announcement_bar",
          value: JSON.stringify(specialOfferAnnouncement),
          description: "Top announcement banner",
        },
      });
      settingsMap["announcement_bar"] = specialOfferAnnouncement;
    }

    // Ensure default bank transfer credentials exist
    if (!settingsMap["bank_details"]) {
      const defaultBankDetails = {
        bankName: "Hatton National Bank (HNB)",
        accountName: "M M Suhaib",
        accountNumber: "169020066035",
        branch: "Kinniya Branch",
        swiftCode: "HBLILKLX",
        instructions:
          "Direct deposit or online fund transfer to HNB account. Please share transfer receipt on WhatsApp for fast verification.",
      };
      await prisma.siteSetting.upsert({
        where: { key: "bank_details" },
        update: {
          value: JSON.stringify(defaultBankDetails),
          description: "Official Bank Transfer details shown during checkout",
        },
        create: {
          key: "bank_details",
          value: JSON.stringify(defaultBankDetails),
          description: "Official Bank Transfer details shown during checkout",
        },
      });
      settingsMap["bank_details"] = defaultBankDetails;
    }

    // Ensure default shipping settings exist
    if (!settingsMap["shipping_settings"]) {
      const defaultShippingSettings = {
        fee: 500,
        freeShippingThreshold: 0,
        label: "Islandwide Courier Delivery",
        estimatedDays: "2-3 business days",
      };
      await prisma.siteSetting.upsert({
        where: { key: "shipping_settings" },
        update: {
          value: JSON.stringify(defaultShippingSettings),
          description: "Courier Shipping rate and threshold settings",
        },
        create: {
          key: "shipping_settings",
          value: JSON.stringify(defaultShippingSettings),
          description: "Courier Shipping rate and threshold settings",
        },
      });
      settingsMap["shipping_settings"] = defaultShippingSettings;
    }

    // Ensure default store contact details exist
    if (!settingsMap["store_contact"]) {
      const defaultStoreContact = {
        whatsappNumber: "+94771234567",
        phone: "+94771234567",
        email: "concierge@legendfashion.com",
      };
      await prisma.siteSetting.upsert({
        where: { key: "store_contact" },
        update: {
          value: JSON.stringify(defaultStoreContact),
          description: "Store contact numbers and support email",
        },
        create: {
          key: "store_contact",
          value: JSON.stringify(defaultStoreContact),
          description: "Store contact numbers and support email",
        },
      });
      settingsMap["store_contact"] = defaultStoreContact;
    }

    return NextResponse.json(settingsMap, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch CMS settings:", error);
    return NextResponse.json({ error: "Failed to fetch CMS settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required to update settings." },
        { status: 401 }
      );
    }

    const body = await request.json(); // e.g. { key: "hero_content", value: {...} }

    const { key, value, description } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const stringValue = typeof value === "string" ? value : JSON.stringify(value);

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: {
        value: stringValue,
        description: description || undefined,
      },
      create: {
        key,
        value: stringValue,
        description: description || null,
      },
    });

    return NextResponse.json(setting);
  } catch (error: any) {
    console.error("Failed to update CMS setting:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update setting" },
      { status: 500 }
    );
  }
}
