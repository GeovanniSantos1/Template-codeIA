"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientList } from "@/components/loans/client-list";
import { usePageConfig } from "@/hooks/use-page-config";
import { api } from "@/lib/api-client";

export default function ClientsPage() {
  usePageConfig("Clientes", "Gerencie seus clientes", [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clientes" },
  ]);

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["clients", debouncedSearch, page],
    queryFn: () =>
      api.get<{
        clients: Array<{
          id: string;
          name: string;
          whatsapp: string | null;
          cpf: string | null;
          address: string | null;
        }>;
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          pages: number;
        };
      }>(`/api/clients?page=${page}&pageSize=20&search=${encodeURIComponent(debouncedSearch)}`),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <ClientList
        clients={data?.clients || []}
        pagination={data?.pagination || { page: 1, pageSize: 20, total: 0, pages: 0 }}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onRefresh={() => refetch()}
      />
    </div>
  );
}
