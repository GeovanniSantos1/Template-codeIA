import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { getOverdueInstallments } from "@/lib/loans/queries";
import { withApiLogging } from "@/lib/logging/api";

async function handleGetOverdue() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const overdue = await getOverdueInstallments(user.id);

    return NextResponse.json({ data: overdue });
  } catch (error) {
    console.error("[Reports/Overdue API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetOverdue, {
  method: "GET",
  route: "/api/reports/overdue",
  feature: "reports",
});
