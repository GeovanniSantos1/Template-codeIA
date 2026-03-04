"use client";

import { ClientForm } from "@/components/loans/client-form";
import { usePageConfig } from "@/hooks/use-page-config";

export default function NewClientPage() {
  usePageConfig("Novo Cliente", "Cadastrar um novo cliente", [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clientes", href: "/clients" },
    { label: "Novo Cliente" },
  ]);

  return <ClientForm mode="create" />;
}
