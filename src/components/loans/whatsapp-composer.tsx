"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send, ExternalLink } from "lucide-react";

type ClientOption = {
  id: string;
  name: string;
  whatsapp: string | null;
};

type WhatsAppComposerProps = {
  clients: ClientOption[];
  isLoadingClients: boolean;
};

const TEMPLATES = [
  {
    label: "Lembrete de parcela",
    text: "Olá {nome}! Tudo bem? Estou entrando em contato para lembrá-lo(a) sobre a parcela do seu empréstimo. Por favor, entre em contato para mais informações.",
  },
  {
    label: "Cobrança em atraso",
    text: "Olá {nome}! Identificamos que uma parcela do seu empréstimo está em atraso. Por favor, entre em contato o mais breve possível para regularizar a situação. Estamos à disposição!",
  },
  {
    label: "Agradecimento de pagamento",
    text: "Olá {nome}! Confirmamos o recebimento do seu pagamento. Muito obrigado pela pontualidade! Qualquer dúvida, estamos à disposição.",
  },
  {
    label: "Mensagem personalizada",
    text: "Olá {nome}! ",
  },
];

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = cleanPhone(phone);
  const full = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppComposer({ clients, isLoadingClients }: WhatsAppComposerProps) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [templateIndex, setTemplateIndex] = useState("0");
  const [message, setMessage] = useState(TEMPLATES[0].text);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  const finalMessage = useMemo(() => {
    if (!selectedClient) return message;
    return message.replace(/\{nome\}/g, selectedClient.name);
  }, [message, selectedClient]);

  const charCount = finalMessage.length;
  const canSend = selectedClient && selectedClient.whatsapp && finalMessage.trim().length > 0;

  function handleTemplateChange(idx: string) {
    setTemplateIndex(idx);
    setMessage(TEMPLATES[Number(idx)].text);
  }

  function handleSend() {
    if (!canSend || !selectedClient?.whatsapp) return;
    const url = buildWhatsAppUrl(selectedClient.whatsapp, finalMessage);
    window.open(url, "_blank");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-green-600" />
          Compor Mensagem WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              disabled={isLoadingClients}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingClients ? "Carregando..." : "Selecione um cliente"} />
              </SelectTrigger>
              <SelectContent>
                {clients
                  .filter((c) => c.whatsapp)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedClient && !selectedClient.whatsapp && (
              <p className="text-xs text-red-500">Cliente sem número de WhatsApp cadastrado.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select value={templateIndex} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mensagem</Label>
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:cursor-not-allowed disabled:opacity-50 neon-border focus-visible:neon-focus"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Use {"{nome}"} para inserir o nome do cliente automaticamente</span>
            <span>{charCount} caracteres</span>
          </div>
        </div>

        {selectedClient && (
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Pré-visualização:</p>
            <p className="text-sm">{finalMessage}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSend} disabled={!canSend} className="gap-2">
            <Send className="h-4 w-4" />
            Enviar via WhatsApp
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
