import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { getDashboardMetrics } from "@/lib/loans/queries";
import { withApiLogging } from "@/lib/logging/api";

async function handleGetDashboard() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const metrics = await getDashboardMetrics(user.id);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("[Reports/Dashboard API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetDashboard, {
  method: "GET",
  route: "/api/reports/dashboard",
  feature: "reports",
});
