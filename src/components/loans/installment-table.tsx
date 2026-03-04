"use client";

import * as React from "react";
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
import { formatCurrency, formatDate } from "@/lib/loans/calculations";
import { CheckCircle } from "lucide-react";

type Installment = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  paidAt?: string | null;
  paidAmount?: number | null;
  penalty: number;
  daysOverdue?: number;
  status: string;
};

type InstallmentTableProps = {
  installments: Installment[];
  onPay?: (installment: Installment) => void;
};

function statusBadge(status: string) {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-600 text-white">Pago</Badge>;
    case "OVERDUE":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "PENDING":
    default:
      return <Badge variant="secondary">Pendente</Badge>;
  }
}

export function InstallmentTable({ installments, onPay }: InstallmentTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Multa</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Pago</TableHead>
            <TableHead className="w-28"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((inst) => {
            const isPending = inst.status !== "PAID";
            const total = inst.amount + (inst.penalty || 0);
            const dueDate = new Date(inst.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            const isOverdue = isPending && dueDate < today;
            const displayStatus = isOverdue && inst.status === "PENDING" ? "OVERDUE" : inst.status;

            return (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">{inst.number}</TableCell>
                <TableCell>{formatDate(inst.dueDate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(inst.amount)}</TableCell>
                <TableCell className="text-right">
                  {inst.penalty > 0 ? (
                    <span className="text-destructive">{formatCurrency(inst.penalty)}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                <TableCell>{statusBadge(displayStatus)}</TableCell>
                <TableCell className="text-right">
                  {inst.paidAmount != null ? formatCurrency(inst.paidAmount) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {isPending && onPay ? (
                    <Button size="sm" variant="outline" onClick={() => onPay(inst)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Pagar
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
