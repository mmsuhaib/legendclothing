import { NextResponse } from "next/server";
import { clearCustomerSessionCookie } from "@/lib/customer-auth";

export async function POST() {
  try {
    await clearCustomerSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sign out:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
