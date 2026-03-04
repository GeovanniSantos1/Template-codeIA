import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { getDueTodayInstallments } from "@/lib/loans/queries";
import { withApiLogging } from "@/lib/logging/api";

async function handleGetDueToday() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const dueToday = await getDueTodayInstallments(user.id);

    return NextResponse.json({ data: dueToday });
  } catch (error) {
    console.error("[Reports/Today API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetDueToday, {
  method: "GET",
  route: "/api/reports/today",
  feature: "reports",
});
