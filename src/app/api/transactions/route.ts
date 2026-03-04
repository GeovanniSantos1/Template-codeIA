import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { withApiLogging } from "@/lib/logging/api";

async function handleGetTransactions(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");
    const type = url.searchParams.get("type");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = { userId: user.id };

    if (type === "ENTRADA" || type === "SAIDA") {
      where.type = type;
    }

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 1);
      where.date = { gte: startDate, lt: endDate };
    } else if (year) {
      const y = parseInt(year, 10);
      const startDate = new Date(y, 0, 1);
      const endDate = new Date(y + 1, 0, 1);
      where.date = { gte: startDate, lt: endDate };
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: { client: { select: { id: true, name: true } }, loan: { select: { id: true } } },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    const serialized = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    return NextResponse.json({
      data: serialized,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[Transactions API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handlePostTransaction(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const body = await request.json();

    const { type, amount, date, notes, clientId, loanId } = body;

    if (!type || !amount || !date) {
      return NextResponse.json(
        { error: "type, amount, and date are required" },
        { status: 400 }
      );
    }

    if (type !== "ENTRADA" && type !== "SAIDA") {
      return NextResponse.json(
        { error: "type must be ENTRADA or SAIDA" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    if (clientId) {
      const client = await db.client.findFirst({
        where: { id: clientId, userId: user.id },
      });
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
    }

    if (loanId) {
      const loan = await db.loan.findFirst({
        where: { id: loanId, userId: user.id },
      });
      if (!loan) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 });
      }
    }

    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        type,
        amount,
        date: new Date(date),
        notes: notes || null,
        clientId: clientId || null,
        loanId: loanId || null,
      },
      include: { client: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      ...transaction,
      amount: Number(transaction.amount),
    }, { status: 201 });
  } catch (error) {
    console.error("[Transactions API] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetTransactions, {
  method: "GET",
  route: "/api/transactions",
  feature: "transactions",
});

export const POST = withApiLogging(handlePostTransaction, {
  method: "POST",
  route: "/api/transactions",
  feature: "transactions",
});
