"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/loans/calculations";
import { Eye } from "lucide-react";

type LoanClient = {
  id: string;
  name: string;
  whatsapp?: string | null;
};

type LoanInstallment = {
  id: string;
  status: string;
  dueDate: string;
  amount: unknown;
};

type Loan = {
  id: string;
  loanDate: string;
  principal: unknown;
  interestRate: unknown;
  installmentsCount: number;
  interval: string;
  status: string;
  client: LoanClient;
  installments: LoanInstallment[];
};

type LoanListProps = {
  loans: Loan[];
};

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-blue-600 text-white">Ativo</Badge>;
    case "PAID_OFF":
      return <Badge className="bg-emerald-600 text-white">Quitado</Badge>;
    case "CANCELLED":
      return <Badge variant="secondary">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function intervalLabel(interval: string) {
  const map: Record<string, string> = {
    DAILY: "Diário",
    WEEKLY: "Semanal",
    BIWEEKLY: "Quinzenal",
    MONTHLY: "Mensal",
  };
  return map[interval] || interval;
}

export function LoanList({ loans }: LoanListProps) {
  if (loans.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum empréstimo encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Principal</TableHead>
            <TableHead className="text-right">Juros</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead>Intervalo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => {
            const principal = typeof loan.principal === "number" ? loan.principal : decimalToNumber(loan.principal as any);
            const interestRate = typeof loan.interestRate === "number" ? loan.interestRate : decimalToNumber(loan.interestRate as any);
            const paidCount = loan.installments.filter((i) => i.status === "PAID").length;

            return (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.client.name}</TableCell>
                <TableCell>{formatDate(loan.loanDate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(principal)}</TableCell>
                <TableCell className="text-right">{interestRate}%</TableCell>
                <TableCell>{loan.installmentsCount}x</TableCell>
                <TableCell>{intervalLabel(loan.interval)}</TableCell>
                <TableCell>{statusBadge(loan.status)}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {paidCount}/{loan.installmentsCount}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/loans/${loan.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
