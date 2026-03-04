"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bell } from "lucide-react";

type InstallmentItem = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  clientName: string;
  clientWhatsapp: string | null;
  loan: { id: string };
};

type DueTodayListProps = {
  installments: InstallmentItem[];
  isLoading: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function openWhatsApp(phone: string | null, clientName: string, amount: number) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá ${clientName}! Tudo bem? A parcela de seu empréstimo no valor de ${formatCurrency(amount)} vence HOJE. Estou enviando essa mensagem para lembrá-lo do pagamento.`
  );
  window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
}

export function DueTodayList({ installments, isLoading }: DueTodayListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-yellow-500" />
            Vence Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-yellow-500" />
          Vence Hoje ({installments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {installments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma parcela vence hoje.</p>
        ) : (
          <div className="space-y-3">
            {installments.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{inst.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Parcela {inst.number} — {formatCurrency(inst.amount)}
                  </p>
                </div>
                {inst.clientWhatsapp && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWhatsApp(inst.clientWhatsapp, inst.clientName, inst.amount)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
