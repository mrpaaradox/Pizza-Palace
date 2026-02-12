import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = {
      database: { name: "Database", status: "active", message: "Connected" },
      email: { name: "Email Service", status: "inactive", message: "Not configured" },
      authentication: { name: "Authentication", status: "active", message: "Working" },
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      status.database = { name: "Database", status: "active", message: "Connected" };
    } catch (error) {
      status.database = { name: "Database", status: "error", message: "Connection failed" };
    }

    // Check email service (Resend)
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY || "");
      await resend.domains.list();
      status.email = { name: "Email Service", status: "active", message: "Active" };
    } catch (error) {
      status.email = { name: "Email Service", status: "inactive", message: "Not configured or invalid API key" };
    }

    return NextResponse.json(Object.values(status));
  } catch (error) {
    console.error("System status error:", error);
    return NextResponse.json({ error: "Failed to fetch system status" }, { status: 500 });
  }
}
