"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";

type TransactionItem = {
  id: string;
  type: "ENTRADA" | "SAIDA";
  amount: number;
  date: string;
  notes: string | null;
  client: { id: string; name: string } | null;
};

type TransactionListProps = {
  transactions: TransactionItem[];
  isLoading: boolean;
  month: string;
  year: string;
  typeFilter: string;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onTypeChange: (v: string) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr));
}

const MONTHS = [
  { value: "", label: "Todos os meses" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export function TransactionList({
  transactions,
  isLoading,
  month,
  year,
  typeFilter,
  onMonthChange,
  onYearChange,
  onTypeChange,
}: TransactionListProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="h-4 w-4" />
          Lançamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select value={month} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value || "all"} value={m.value || "all"}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ENTRADA">Entrada</SelectItem>
              <SelectItem value="SAIDA">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="h-40 bg-muted animate-pulse rounded" />
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhum lançamento encontrado.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "ENTRADA" ? "default" : "destructive"}>
                        {tx.type === "ENTRADA" ? "Entrada" : "Saída"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={tx.type === "ENTRADA" ? "text-green-600" : "text-red-600"}
                    >
                      {tx.type === "ENTRADA" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>{tx.client?.name || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tx.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
