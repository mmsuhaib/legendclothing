import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  setAdminSessionCookie,
  verifyAdminPassword,
  hashAdminPassword,
} from "@/lib/admin-auth";

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

    // Look up admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials. Account not found." },
        { status: 401 }
      );
    }

    // Cryptographic password verification with constant-time comparison
    const { isValid, needsRehash } = verifyAdminPassword(password, admin.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password provided." },
        { status: 401 }
      );
    }

    // If password was plaintext or older hash, automatically rehash to salted PBKDF2-SHA512
    if (needsRehash) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash: hashAdminPassword(password) },
      }).catch((e) => console.error("Failed to rehash admin password:", e));
    }


    // Set signed session cookie
    await setAdminSessionCookie({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
