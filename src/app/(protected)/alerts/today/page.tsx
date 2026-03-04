"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useSetPageMetadata } from "@/contexts/page-metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, MessageSquare } from "lucide-react";

type InstallmentItem = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  clientName: string;
  clientWhatsapp: string | null;
  loan: { id: string };
};

type DueTodayResponse = {
  data: InstallmentItem[];
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

export default function AlertsTodayPage() {
  useSetPageMetadata({
    title: "Vence Hoje",
    description: "Parcelas com vencimento para hoje",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Alertas" },
      { label: "Vence Hoje" },
    ],
  });

  const { data, isLoading } = useQuery<DueTodayResponse>({
    queryKey: ["reports-today"],
    queryFn: () => api.get("/api/reports/today"),
  });

  const installments = data?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-500" />
            Parcelas que Vencem Hoje
            <Badge variant="secondary">{installments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 bg-muted animate-pulse rounded" />
          ) : installments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma parcela vence hoje.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.clientName}</TableCell>
                      <TableCell>#{inst.number}</TableCell>
                      <TableCell>{formatCurrency(inst.amount)}</TableCell>
                      <TableCell className="text-right">
                        {inst.clientWhatsapp && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openWhatsApp(inst.clientWhatsapp, inst.clientName, inst.amount)
                            }
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Lembrar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
