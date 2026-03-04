"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";

export interface ClientFormData {
  name: string;
  whatsapp: string;
  cpf: string;
  address: string;
  motherName: string;
  pix: string;
  bank: string;
  agency: string;
  account: string;
  reserve: string;
  line: string;
  notes: string;
}

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  clientId?: string;
  mode: "create" | "edit";
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ClientForm({ initialData, clientId, mode }: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<ClientFormData>({
    name: initialData?.name || "",
    whatsapp: initialData?.whatsapp || "",
    cpf: initialData?.cpf || "",
    address: initialData?.address || "",
    motherName: initialData?.motherName || "",
    pix: initialData?.pix || "",
    bank: initialData?.bank || "",
    agency: initialData?.agency || "",
    account: initialData?.account || "",
    reserve: initialData?.reserve || "",
    line: initialData?.line || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "cpf") {
      setForm((prev) => ({ ...prev, cpf: formatCpf(value) }));
    } else if (name === "whatsapp") {
      setForm((prev) => ({ ...prev, whatsapp: formatPhone(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        whatsapp: form.whatsapp || null,
        cpf: form.cpf || null,
        address: form.address || null,
        motherName: form.motherName || null,
        pix: form.pix || null,
        bank: form.bank || null,
        agency: form.agency || null,
        account: form.account || null,
        reserve: form.reserve ? parseFloat(form.reserve) : null,
        line: form.line ? parseInt(form.line, 10) : null,
        notes: form.notes || null,
      };

      if (mode === "create") {
        await api.post("/api/clients", payload);
        toast({ title: "Cliente criado com sucesso!" });
        router.push("/clients");
      } else {
        await api.put(`/api/clients/${clientId}`, payload);
        toast({ title: "Cliente atualizado com sucesso!" });
        router.push(`/clients/${clientId}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar cliente";
      toast({ title: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherName">Nome da Mãe</Label>
            <Input
              id="motherName"
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
              placeholder="Nome da mãe"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Endereço completo"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Bancários</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pix">PIX</Label>
            <Input
              id="pix"
              name="pix"
              value={form.pix}
              onChange={handleChange}
              placeholder="Chave PIX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank">Banco</Label>
            <Input
              id="bank"
              name="bank"
              value={form.bank}
              onChange={handleChange}
              placeholder="Nome do banco"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agency">Agência</Label>
            <Input
              id="agency"
              name="agency"
              value={form.agency}
              onChange={handleChange}
              placeholder="Agência"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Conta</Label>
            <Input
              id="account"
              name="account"
              value={form.account}
              onChange={handleChange}
              placeholder="Número da conta"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reserve">Reserva (R$)</Label>
            <Input
              id="reserve"
              name="reserve"
              type="number"
              step="0.01"
              value={form.reserve}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="line">Linha</Label>
            <Input
              id="line"
              name="line"
              type="number"
              value={form.line}
              onChange={handleChange}
              placeholder="Número da linha"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Observações sobre o cliente"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Criar Cliente" : "Salvar Alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
