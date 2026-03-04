"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

type TransactionFormProps = {
  onSubmit: (data: {
    type: "ENTRADA" | "SAIDA";
    amount: number;
    date: string;
    notes: string;
  }) => void;
  isLoading: boolean;
};

export function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const [type, setType] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    onSubmit({ type, amount: numAmount, date, notes });
    setAmount("");
    setNotes("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PlusCircle className="h-4 w-4" />
          Novo Lançamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="tx-type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as "ENTRADA" | "SAIDA")}>
              <SelectTrigger id="tx-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRADA">Entrada</SelectItem>
                <SelectItem value="SAIDA">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-amount">Valor (R$)</Label>
            <Input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-date">Data</Label>
            <Input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-notes">Observação</Label>
            <Input
              id="tx-notes"
              placeholder="Opcional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" isLoading={isLoading} className="w-full">
              <PlusCircle className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
