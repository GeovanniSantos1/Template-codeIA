"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, MessageCircle, ArrowLeft, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageConfig } from "@/hooks/use-page-config";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate, decimalToNumber } from "@/lib/loans/calculations";

interface Loan {
  id: string;
  loanDate: string;
  principal: number | { toString(): string };
  interestRate: number | { toString(): string };
  installmentsCount: number;
  interval: string;
  status: string;
}

interface ClientDetail {
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
  loans: Loan[];
}

function whatsappLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const number = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${number}`;
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  PAID_OFF: "Quitado",
  CANCELLED: "Cancelado",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PAID_OFF: "secondary",
  CANCELLED: "destructive",
};

const intervalLabels: Record<string, string> = {
  DAILY: "Diário",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
};

function toNum(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  return Number(val);
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [showDelete, setShowDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () =>
      api.get<{ client: ClientDetail }>(`/api/clients/${clientId}`),
    enabled: !!clientId,
  });

  const client = data?.client;

  usePageConfig(
    client?.name || "Cliente",
    "Detalhes do cliente",
    [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Clientes", href: "/clients" },
      { label: client?.name || "Cliente" },
    ]
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/clients/${clientId}`);
      toast({ title: "Cliente excluído com sucesso!" });
      router.push("/clients");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir cliente";
      toast({ title: message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/clients">Voltar para Clientes</Link>
        </Button>
      </div>
    );
  }

  const waLink = whatsappLink(client.whatsapp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {waLink && (
            <Button variant="outline" size="sm" asChild>
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clients/${clientId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nome" value={client.name} />
            <InfoRow label="CPF" value={client.cpf} />
            <InfoRow label="WhatsApp" value={client.whatsapp} />
            <InfoRow label="Nome da Mãe" value={client.motherName} />
            <InfoRow label="Endereço" value={client.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Bancários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="PIX" value={client.pix} />
            <InfoRow label="Banco" value={client.bank} />
            <InfoRow label="Agência" value={client.agency} />
            <InfoRow label="Conta" value={client.account} />
            <InfoRow
              label="Reserva"
              value={
                client.reserve != null
                  ? formatCurrency(toNum(client.reserve))
                  : null
              }
            />
            <InfoRow
              label="Linha"
              value={client.line != null ? String(client.line) : null}
            />
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Empréstimos ({client.loans.length})
          </CardTitle>
          <Button size="sm" asChild>
            <Link href={`/loans/new?clientId=${clientId}`}>
              Novo Empréstimo
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {client.loans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum empréstimo registrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Juros</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Intervalo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{formatDate(loan.loanDate)}</TableCell>
                    <TableCell>
                      {formatCurrency(toNum(loan.principal))}
                    </TableCell>
                    <TableCell>{toNum(loan.interestRate)}%</TableCell>
                    <TableCell>{loan.installmentsCount}x</TableCell>
                    <TableCell>
                      {intervalLabels[loan.interval] || loan.interval}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[loan.status] || "outline"}>
                        {statusLabels[loan.status] || loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/loans/${loan.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {client.name}? Esta ação não pode
              ser desfeita e todos os empréstimos associados serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
