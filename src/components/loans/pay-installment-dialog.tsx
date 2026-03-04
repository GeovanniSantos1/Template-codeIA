"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/loans/calculations";

type Installment = {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  penalty: number;
  status: string;
};

type PayInstallmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: Installment | null;
  onConfirm: (data: { installmentId: string; paidAmount: number; paidAt: string }) => void;
  isLoading?: boolean;
};

export function PayInstallmentDialog({
  open,
  onOpenChange,
  installment,
  onConfirm,
  isLoading,
}: PayInstallmentDialogProps) {
  const [paidAmount, setPaidAmount] = React.useState("");
  const [paidAt, setPaidAt] = React.useState("");

  React.useEffect(() => {
    if (installment && open) {
      const total = installment.amount + (installment.penalty || 0);
      setPaidAmount(String(total));
      setPaidAt(new Date().toISOString().split("T")[0]);
    }
  }, [installment, open]);

  if (!installment) return null;

  const totalDue = installment.amount + (installment.penalty || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Parcela {installment.number} — Vencimento: {formatDate(installment.dueDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da parcela:</span>
              <span>{formatCurrency(installment.amount)}</span>
            </div>
            {installment.penalty > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multa/Juros:</span>
                <span className="text-destructive">{formatCurrency(installment.penalty)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total devido:</span>
              <span>{formatCurrency(totalDue)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Valor pago (R$)</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAt">Data do pagamento</Label>
            <Input
              id="paidAt"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            isLoading={isLoading}
            onClick={() => {
              if (!paidAmount || !paidAt) return;
              onConfirm({
                installmentId: installment.id,
                paidAmount: parseFloat(paidAmount),
                paidAt: new Date(paidAt + "T12:00:00").toISOString(),
              });
            }}
          >
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
