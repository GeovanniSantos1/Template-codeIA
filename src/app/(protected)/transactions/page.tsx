"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useSetPageMetadata } from "@/contexts/page-metadata";
import { TransactionForm } from "@/components/loans/transaction-form";
import { TransactionList } from "@/components/loans/transaction-list";
import { useToast } from "@/hooks/use-toast";

type TransactionItem = {
  id: string;
  type: "ENTRADA" | "SAIDA";
  amount: number;
  date: string;
  notes: string | null;
  client: { id: string; name: string } | null;
};

type TransactionsResponse = {
  data: TransactionItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function TransactionsPage() {
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useSetPageMetadata({
    title: "Lançamentos",
    description: "Gerencie entradas e saídas financeiras",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Lançamentos" },
    ],
  });

  const params = new URLSearchParams();
  if (month && month !== "all") params.set("month", month);
  if (year && year !== "all") params.set("year", year);
  if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);

  const { data, isLoading } = useQuery<TransactionsResponse>({
    queryKey: ["transactions", month, year, typeFilter],
    queryFn: () => api.get(`/api/transactions?${params.toString()}`),
  });

  const createMutation = useMutation({
    mutationFn: (txData: { type: "ENTRADA" | "SAIDA"; amount: number; date: string; notes: string }) =>
      api.post("/api/transactions", txData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({ title: "Lançamento criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar lançamento", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <TransactionForm
        onSubmit={(txData) => createMutation.mutate(txData)}
        isLoading={createMutation.isPending}
      />
      <TransactionList
        transactions={data?.data || []}
        isLoading={isLoading}
        month={month}
        year={year}
        typeFilter={typeFilter}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onTypeChange={setTypeFilter}
      />
    </div>
  );
}
