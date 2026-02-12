import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "pizza-admin-2025";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secretKey } = body;

    // Validate secret key
    if (secretKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 401 }
      );
    }

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already admin
    if ((user as any).role === "ADMIN") {
      return NextResponse.json(
        { message: "User is already an admin", user },
        { status: 200 }
      );
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      message: `Successfully made ${user.email} an admin!`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Make admin error:", error);
    return NextResponse.json(
      { error: "Failed to make user admin" },
      { status: 500 }
    );
  }
}
