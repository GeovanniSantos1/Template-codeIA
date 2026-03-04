import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { withApiLogging } from "@/lib/logging/api";

const CreateClientSchema = z.object({
  name: z.string().min(1).max(200),
  whatsapp: z.string().max(30).optional().nullable(),
  cpf: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  motherName: z.string().max(200).optional().nullable(),
  pix: z.string().max(200).optional().nullable(),
  bank: z.string().max(100).optional().nullable(),
  agency: z.string().max(20).optional().nullable(),
  account: z.string().max(30).optional().nullable(),
  reserve: z.number().optional().nullable(),
  line: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
});

async function handleClientsGet(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));
    const search = searchParams.get("search")?.trim() || "";

    const whereClause: Record<string, unknown> = { userId: user.id };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { cpf: { contains: search, mode: "insensitive" as const } },
        { whatsapp: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const [total, clients] = await Promise.all([
      db.client.count({ where: whereClause }),
      db.client.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json({ error: "Falha ao buscar clientes" }, { status: 500 });
  }
}

async function handleClientsPost(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);

    const body = await request.json().catch(() => null);
    const parsed = CreateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const client = await db.client.create({
      data: {
        userId: user.id,
        name: data.name,
        whatsapp: data.whatsapp ?? null,
        cpf: data.cpf ?? null,
        address: data.address ?? null,
        motherName: data.motherName ?? null,
        pix: data.pix ?? null,
        bank: data.bank ?? null,
        agency: data.agency ?? null,
        account: data.account ?? null,
        reserve: data.reserve ?? null,
        line: data.line ?? null,
        notes: data.notes ?? null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Failed to create client:", error);
    return NextResponse.json({ error: "Falha ao criar cliente" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleClientsGet, {
  method: "GET",
  route: "/api/clients",
  feature: "clients",
});

export const POST = withApiLogging(handleClientsPost, {
  method: "POST",
  route: "/api/clients",
  feature: "clients",
});
