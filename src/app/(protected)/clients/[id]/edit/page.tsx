"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientForm } from "@/components/loans/client-form";
import { usePageConfig } from "@/hooks/use-page-config";
import { api } from "@/lib/api-client";

interface ClientData {
  id: string;
  name: string;
  whatsapp: string | null;
  cpf: string | null;
  address: string | null;
  motherName: string | null;
  pix: string | null;
  bank: string | null;
  agency: string | null;
  account: string | null;
  reserve: number | { toString(): string } | null;
  line: number | null;
  notes: string | null;
}

export default function EditClientPage() {
  const params = useParams();
  const clientId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () =>
      api.get<{ client: ClientData }>(`/api/clients/${clientId}`),
    enabled: !!clientId,
  });

  const client = data?.client;

  usePageConfig(
    client ? `Editar ${client.name}` : "Editar Cliente",
    "Atualizar dados do cliente",
    [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Clientes", href: "/clients" },
      { label: client?.name || "Cliente", href: `/clients/${clientId}` },
      { label: "Editar" },
    ]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
      </div>
    );
  }

  const toStr = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

  return (
    <ClientForm
      mode="edit"
      clientId={clientId}
      initialData={{
        name: client.name,
        whatsapp: client.whatsapp || "",
        cpf: client.cpf || "",
        address: client.address || "",
        motherName: client.motherName || "",
        pix: client.pix || "",
        bank: client.bank || "",
        agency: client.agency || "",
        account: client.account || "",
        reserve: toStr(client.reserve),
        line: toStr(client.line),
        notes: client.notes || "",
      }}
    />
  );
}
