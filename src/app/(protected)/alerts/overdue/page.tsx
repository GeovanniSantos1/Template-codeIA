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
import { AlertTriangle, MessageSquare } from "lucide-react";

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

type OverdueResponse = {
  data: OverdueItem[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr));
}

function openWhatsApp(
  phone: string | null,
  clientName: string,
  amount: number,
  daysOverdue: number
) {
  if (!phone) return;
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá ${clientName}! Identificamos que a parcela de seu empréstimo no valor de ${formatCurrency(amount)} está em atraso há ${daysOverdue} dia(s). Por favor, entre em contato para regularizar.`
  );
  window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
}

export default function AlertsOverduePage() {
  useSetPageMetadata({
    title: "Inadimplentes",
    description: "Parcelas em atraso",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Alertas" },
      { label: "Inadimplentes" },
    ],
  });

  const { data, isLoading } = useQuery<OverdueResponse>({
    queryKey: ["reports-overdue"],
    queryFn: () => api.get("/api/reports/overdue"),
  });

  const installments = data?.data || [];

  const totalPenalty = installments.reduce((sum, i) => sum + i.penalty, 0);
  const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {!isLoading && installments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Parcelas em atraso</p>
              <p className="text-2xl font-bold">{installments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total em aberto</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total em multas</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPenalty)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Parcelas em Atraso
            <Badge variant="destructive">{installments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 bg-muted animate-pulse rounded" />
          ) : installments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma parcela em atraso. Parabéns!
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Dias Atraso</TableHead>
                    <TableHead>Multa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.clientName}</TableCell>
                      <TableCell>#{inst.number}</TableCell>
                      <TableCell>{formatDate(inst.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(inst.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{inst.daysOverdue}d</Badge>
                      </TableCell>
                      <TableCell className="text-orange-600">
                        {inst.penalty > 0 ? formatCurrency(inst.penalty) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {inst.clientWhatsapp && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openWhatsApp(
                                inst.clientWhatsapp,
                                inst.clientName,
                                inst.amount,
                                inst.daysOverdue
                              )
                            }
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Cobrar
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
