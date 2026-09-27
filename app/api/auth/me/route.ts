import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET() {
  try {
    const user = await getCustomerSession();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to verify customer session:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
