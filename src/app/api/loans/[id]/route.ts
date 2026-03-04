import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { z } from "zod";

const updateLoanSchema = z.object({
  penaltyPerDay: z.number().min(0).optional(),
  status: z.enum(["ACTIVE", "PAID_OFF", "CANCELLED"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserFromClerkId(clerkId);
    const { id } = await params;

    const loan = await db.loan.findFirst({
      where: { id, userId: user.id },
      include: {
        client: true,
        installments: { orderBy: { number: "asc" } },
        transactions: { orderBy: { date: "desc" } },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: loan });
  } catch (error) {
    console.error("Error fetching loan:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserFromClerkId(clerkId);
    const { id } = await params;
    const body = await req.json();
    const parsed = updateLoanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.loan.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    const loan = await db.loan.update({
      where: { id },
      data: parsed.data,
      include: {
        client: true,
        installments: { orderBy: { number: "asc" } },
      },
    });

    return NextResponse.json({ success: true, data: loan });
  } catch (error) {
    console.error("Error updating loan:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserFromClerkId(clerkId);
    const { id } = await params;

    const existing = await db.loan.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    const loan = await db.loan.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { client: true },
    });

    return NextResponse.json({ success: true, data: loan });
  } catch (error) {
    console.error("Error cancelling loan:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
