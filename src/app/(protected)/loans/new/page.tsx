"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { usePageConfig } from "@/hooks/use-page-config";
import { LoanForm } from "@/components/loans/loan-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewLoanPage() {
  usePageConfig("Novo Empréstimo", "Crie um novo empréstimo", [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empréstimos", href: "/loans" },
    { label: "Novo" },
  ]);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ["clients-all"],
    queryFn: () => api.get<any>("/api/clients?pageSize=100"),
  });

  const createLoan = useMutation({
    mutationFn: (data: any) => api.post("/api/loans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast({ title: "Empréstimo criado com sucesso!" });
      router.push("/loans");
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao criar empréstimo",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (loadingClients) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const clients = clientsData?.clients || [];

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cadastre um cliente antes de criar um empréstimo.
      </div>
    );
  }

  return (
    <LoanForm
      clients={clients}
      onSubmit={(data) => createLoan.mutate(data)}
      isLoading={createLoan.isPending}
    />
  );
}
