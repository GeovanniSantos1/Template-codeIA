"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSetPageMetadata } from "@/contexts/page-metadata";
import { DashboardMetrics } from "@/components/loans/dashboard-metrics";
import { DueTodayList } from "@/components/loans/due-today-list";
import { OverdueList } from "@/components/loans/overdue-list";

export default function DashboardPage() {
  const { user } = useUser();
  const [metrics, setMetrics] = useState(null);
  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useSetPageMetadata({
    title: `Bem-vindo, ${user?.firstName || "Usuário"}!`,
    description: "Visão geral dos seus empréstimos",
    breadcrumbs: [{ label: "Dashboard" }],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, todayRes, overdueRes] = await Promise.all([
          fetch("/api/reports/dashboard"),
          fetch("/api/reports/today"),
          fetch("/api/reports/overdue"),
        ]);
        if (metricsRes.ok) {
          const metricsJson = await metricsRes.json();
          setMetrics(metricsJson.data || metricsJson);
        }
        if (todayRes.ok) {
          const todayJson = await todayRes.json();
          setDueToday(todayJson.data || todayJson || []);
        }
        if (overdueRes.ok) {
          const overdueJson = await overdueRes.json();
          setOverdue(overdueJson.data || overdueJson || []);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <DashboardMetrics metrics={metrics} isLoading={loading} />
      <div className="grid gap-6 md:grid-cols-2">
        <DueTodayList installments={dueToday} isLoading={loading} />
        <OverdueList installments={overdue} isLoading={loading} limit={10} />
      </div>
    </div>
  );
}
