"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Bell, Briefcase } from "lucide-react";

type DashboardMetricsProps = {
  metrics: {
    totalLent: number;
    totalReceived: number;
    totalOwed: number;
    receivedPrincipal: number;
    receivedInterest: number;
    provisionTotal: number;
    overdueCount: number;
    dueTodayCount: number;
    activeLoansCount: number;
  } | null;
  isLoading: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function DashboardMetrics({ metrics, isLoading }: DashboardMetricsProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Emprestado",
      value: formatCurrency(metrics.totalLent),
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      title: "Total Recebido",
      value: formatCurrency(metrics.totalReceived),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Total Devido",
      value: formatCurrency(metrics.totalOwed),
      icon: TrendingDown,
      color: "text-orange-500",
    },
    {
      title: "Empréstimos Ativos",
      value: metrics.activeLoansCount.toString(),
      icon: Briefcase,
      color: "text-purple-500",
    },
    {
      title: "Vence Hoje",
      value: metrics.dueTodayCount.toString(),
      icon: Bell,
      color: "text-yellow-500",
    },
    {
      title: "Inadimplentes",
      value: metrics.overdueCount.toString(),
      icon: AlertTriangle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
