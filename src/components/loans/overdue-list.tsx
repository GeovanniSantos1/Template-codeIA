"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertTriangle } from "lucide-react";

type OverdueItem = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  penalty: number;
  daysOverdue: number;
  clientName: string;
  clientWhatsapp: string | null;
  loan: { id: string };
};

type OverdueListProps = {
  installments: OverdueItem[];
  isLoading: boolean;
  limit?: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function openWhatsApp(phone: string | null, clientName: string, amount: number, daysOverdue: number) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá ${clientName}! Tudo bem? Identificamos que a parcela de seu empréstimo no valor de ${formatCurrency(amount)} está em atraso há ${daysOverdue} dia(s). Por favor, entre em contato para regularizar.`
  );
  window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
}

export function OverdueList({ installments, isLoading, limit }: OverdueListProps) {
  const items = limit ? installments.slice(0, limit) : installments;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Inadimplentes
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
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Inadimplentes ({installments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma parcela em atraso.</p>
        ) : (
          <div className="space-y-3">
            {items.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{inst.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Parcela {inst.number} — {formatCurrency(inst.amount)} — {inst.daysOverdue} dia(s) atraso
                  </p>
                  {inst.penalty > 0 && (
                    <p className="text-xs text-red-500">
                      Multa: {formatCurrency(inst.penalty)}
                    </p>
                  )}
                </div>
                {inst.clientWhatsapp && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWhatsApp(inst.clientWhatsapp, inst.clientName, inst.amount, inst.daysOverdue)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Cobrar
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
