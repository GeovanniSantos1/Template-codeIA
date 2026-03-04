"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useSetPageMetadata } from "@/contexts/page-metadata";
import { WhatsAppComposer } from "@/components/loans/whatsapp-composer";

type ClientOption = {
  id: string;
  name: string;
  whatsapp: string | null;
};

type ClientsResponse = {
  clients: ClientOption[];
};

export default function MessagesPage() {
  useSetPageMetadata({
    title: "Mensagens",
    description: "Envie mensagens via WhatsApp para seus clientes",
    breadcrumbs: [
      { label: "Início", href: "/dashboard" },
      { label: "Mensagens" },
    ],
  });

  const { data, isLoading } = useQuery<ClientsResponse>({
    queryKey: ["clients-for-messages"],
    queryFn: () => api.get("/api/clients?pageSize=100"),
  });

  return (
    <div className="space-y-6">
      <WhatsAppComposer
        clients={data?.clients || []}
        isLoadingClients={isLoading}
      />
    </div>
  );
}
