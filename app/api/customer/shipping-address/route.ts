import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

/**
 * GET /api/customer/shipping-address
 * Fetch the authenticated customer's saved shipping address
 */
export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedAddress = await prisma.address.findFirst({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
    });

    if (!savedAddress) {
      // Fallback to user profile if available
      const nameParts = (session.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      return NextResponse.json({
        address: {
          country: "Sri Lanka",
          firstName,
          lastName,
          address: "",
          city: "",
          postalCode: "",
          contactNo1: session.phone || "",
          contactNo2: "",
        },
        hasSavedAddress: false,
      });
    }

    const nameParts = (savedAddress.fullName || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return NextResponse.json({
      address: {
        country: savedAddress.country || "Sri Lanka",
        firstName,
        lastName,
        address: savedAddress.streetAddress || "",
        city: savedAddress.city || "",
        postalCode: savedAddress.postalCode || "",
        contactNo1: savedAddress.phone || "",
        contactNo2: savedAddress.apartment || "",
      },
      hasSavedAddress: true,
    });
  } catch (error: any) {
    console.error("Error fetching shipping address:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping address" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer/shipping-address
 * Save or update the authenticated customer's shipping address
 */
export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      country,
      firstName,
      lastName,
      address,
      city,
      postalCode,
      contactNo1,
      contactNo2,
    } = body;

    if (!firstName || !lastName || !address || !city || !postalCode || !contactNo1) {
      return NextResponse.json(
        { error: "Please provide all required shipping fields." },
        { status: 400 }
      );
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Check if customer already has a saved address
    const existing = await prisma.address.findFirst({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
    });

    let saved;
    if (existing) {
      saved = await prisma.address.update({
        where: { id: existing.id },
        data: {
          fullName,
          streetAddress: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country || "Sri Lanka",
          phone: contactNo1.trim(),
          apartment: contactNo2 ? contactNo2.trim() : null,
          isDefault: true,
        },
      });
    } else {
      saved = await prisma.address.create({
        data: {
          userId: session.id,
          fullName,
          streetAddress: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country || "Sri Lanka",
          phone: contactNo1.trim(),
          apartment: contactNo2 ? contactNo2.trim() : null,
          isDefault: true,
        },
      });
    }

    // Also update user's profile phone/name if missing
    await prisma.user.update({
      where: { id: session.id },
      data: {
        name: session.name || fullName,
        phone: session.phone || contactNo1.trim(),
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      address: {
        country: saved.country,
        firstName,
        lastName,
        address: saved.streetAddress,
        city: saved.city,
        postalCode: saved.postalCode,
        contactNo1: saved.phone,
        contactNo2: saved.apartment || "",
      },
    });
  } catch (error: any) {
    console.error("Error saving shipping address:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save shipping address" },
      { status: 500 }
    );
  }
}
