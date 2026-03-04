import { db } from "@/lib/db";
import { calculatePenalty, calculateDaysOverdue, decimalToNumber } from "./calculations";

export async function getDashboardMetrics(userId: string) {
  const loans = await db.loan.findMany({
    where: { userId, status: "ACTIVE" },
    include: { installments: true, client: true },
  });

  let totalLent = 0;
  let totalReceived = 0;
  let receivedPrincipal = 0;
  let receivedInterest = 0;
  let provisionPrincipal = 0;
  let provisionInterest = 0;
  let overdueCount = 0;
  let dueTodayCount = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const loan of loans) {
    const principal = decimalToNumber(loan.principal);
    const interestRate = decimalToNumber(loan.interestRate);
    const interest = principal * (interestRate / 100);
    const totalDebt = principal + interest;
    const installmentAmount = totalDebt / loan.installmentsCount;

    totalLent += principal;

    for (const inst of loan.installments) {
      const amount = decimalToNumber(inst.amount);
      const principalPortion = principal / loan.installmentsCount;
      const interestPortion = interest / loan.installmentsCount;

      if (inst.status === "PAID") {
        const paid = decimalToNumber(inst.paidAmount) || amount;
        totalReceived += paid;
        receivedPrincipal += principalPortion;
        receivedInterest += interestPortion;
      } else {
        provisionPrincipal += principalPortion;
        provisionInterest += interestPortion;

        const dueDate = new Date(inst.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
          dueTodayCount++;
        } else if (dueDate < today) {
          overdueCount++;
        }
      }
    }
  }

  return {
    totalLent,
    totalReceived,
    receivedPrincipal,
    receivedInterest,
    provisionPrincipal,
    provisionInterest,
    provisionTotal: provisionPrincipal + provisionInterest,
    totalInterest: receivedInterest + provisionInterest,
    totalOwed: provisionPrincipal + provisionInterest,
    overdueCount,
    dueTodayCount,
    activeLoansCount: loans.length,
  };
}

export async function getOverdueInstallments(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const installments = await db.installment.findMany({
    where: {
      loan: { userId, status: "ACTIVE" },
      status: { in: ["PENDING", "OVERDUE"] },
      dueDate: { lt: today },
    },
    include: {
      loan: { include: { client: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return installments.map((inst) => {
    const daysOverdue = calculateDaysOverdue(inst.dueDate);
    const penalty = calculatePenalty(
      decimalToNumber(inst.amount),
      decimalToNumber(inst.loan.penaltyPerDay),
      daysOverdue
    );
    return {
      ...inst,
      amount: decimalToNumber(inst.amount),
      penalty: Math.round(penalty * 100) / 100,
      daysOverdue,
      clientName: inst.loan.client.name,
      clientWhatsapp: inst.loan.client.whatsapp,
    };
  });
}

export async function getDueTodayInstallments(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const installments = await db.installment.findMany({
    where: {
      loan: { userId, status: "ACTIVE" },
      status: "PENDING",
      dueDate: { gte: today, lt: tomorrow },
    },
    include: {
      loan: { include: { client: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return installments.map((inst) => ({
    ...inst,
    amount: decimalToNumber(inst.amount),
    clientName: inst.loan.client.name,
    clientWhatsapp: inst.loan.client.whatsapp,
  }));
}
