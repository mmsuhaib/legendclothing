import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setCustomerSessionCookie } from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up customer user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please register or check your email." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password provided. Please try again." },
        { status: 401 }
      );
    }

    // Set signed customer session cookie
    await setCustomerSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Customer login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in." },
      { status: 500 }
    );
  }
}
