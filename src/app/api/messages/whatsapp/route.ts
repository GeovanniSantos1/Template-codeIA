import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { withApiLogging } from "@/lib/logging/api";
import { decimalToNumber, formatCurrency, formatDate } from "@/lib/loans/calculations";

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanedPhone = cleanPhone(phone);
  const fullPhone = cleanedPhone.startsWith("55") ? cleanedPhone : `55${cleanedPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

async function handlePostWhatsApp(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const body = await request.json();

    const { clientId, message, installmentId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const client = await db.client.findFirst({
      where: { id: clientId, userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.whatsapp) {
      return NextResponse.json(
        { error: "Client does not have a WhatsApp number" },
        { status: 400 }
      );
    }

    let finalMessage = message || "";

    if (!message && installmentId) {
      const installment = await db.installment.findFirst({
        where: { id: installmentId, loan: { userId: user.id } },
        include: { loan: true },
      });

      if (installment) {
        const amount = decimalToNumber(installment.amount);
        const dueDate = formatDate(installment.dueDate);
        finalMessage = `Olá ${client.name}, seu pagamento de ${formatCurrency(amount)} vence em ${dueDate}. Por favor, entre em contato para mais informações.`;
      }
    }

    if (!finalMessage) {
      finalMessage = `Olá ${client.name}, entre em contato para mais informações sobre seu empréstimo.`;
    }

    const url = buildWhatsAppUrl(client.whatsapp, finalMessage);

    return NextResponse.json({ url, phone: client.whatsapp, message: finalMessage });
  } catch (error) {
    console.error("[Messages/WhatsApp API] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withApiLogging(handlePostWhatsApp, {
  method: "POST",
  route: "/api/messages/whatsapp",
  feature: "messages",
});
