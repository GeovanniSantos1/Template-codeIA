# Objective
Build the LoanManager MVP — a loan management SaaS app — on top of the existing Next.js + Clerk + Asaas + Prisma template. The app replaces an Excel spreadsheet for managing personal loans, including client registration, loan creation with up to 30 installments, automatic interest/penalty calculations, cash flow tracking, WhatsApp messaging, and a financial dashboard.

The existing template already provides: Clerk auth, Asaas subscription/payment, credit system, admin panel, file storage, and a working UI component library (shadcn/ui). We build the loan-specific modules on top of this foundation.

# Tasks

### T001: Database Schema — Prisma Models & Migration
- **Blocked By**: []
- **Details**:
  - Add 4 new models to `prisma/schema.prisma`: `Client`, `Loan`, `Installment`, `Transaction`
  - Add enums: `LoanInterval` (DAILY, WEEKLY, BIWEEKLY, MONTHLY), `LoanStatus` (ACTIVE, PAID_OFF, CANCELLED), `InstallmentStatus` (PENDING, PAID, OVERDUE), `TransactionType` (ENTRADA, SAIDA)
  - All models include `userId` (FK to User via clerkId) for multi-tenant data isolation
  - Client → Loan (1:N), Loan → Installment (1:N), Transaction → Client/Loan (optional FKs)
  - Run `prisma migrate dev` to generate and apply migration
  - Files: `prisma/schema.prisma`
  - Acceptance: Migration applies cleanly, `npx prisma db push` succeeds

### T002: Server-Side Business Logic — Loan Calculations & Queries
- **Blocked By**: [T001]
- **Details**:
  - Create `src/lib/loans/calculations.ts` — pure functions for:
    - Interest calculation: `principal × interestRate`
    - Total debt: `principal + interest`
    - Installment amount: `totalDebt / installmentsCount`
    - Installment due dates based on interval (daily/weekly/biweekly/monthly)
    - Penalty calculation: `installmentAmount × penaltyPerDay × daysOverdue`
    - Current debt: sum of unpaid installments + accumulated penalties
  - Create `src/lib/loans/queries.ts` — Prisma query helpers for:
    - Dashboard metrics (total lent, total received, overdue count, due today, etc.)
    - Client summary queries
    - Loan detail with installments
  - Files: `src/lib/loans/calculations.ts`, `src/lib/loans/queries.ts`
  - Acceptance: Calculation functions produce correct results per PRD formulas

### T003: API Routes — Clients CRUD
- **Blocked By**: [T001]
- **Details**:
  - `src/app/api/clients/route.ts` — GET (list with search/pagination), POST (create)
  - `src/app/api/clients/[id]/route.ts` — GET (detail), PUT (update), DELETE (delete)
  - All routes: authenticate via Clerk, filter by userId for data isolation
  - Validate request bodies with Zod
  - Files: `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/route.ts`
  - Acceptance: Full CRUD works, data is tenant-isolated

### T004: API Routes — Loans CRUD + Installment Management
- **Blocked By**: [T001, T002]
- **Details**:
  - `src/app/api/loans/route.ts` — GET (list with filters: client, status, overdue), POST (create loan + auto-generate installments)
  - `src/app/api/loans/[id]/route.ts` — GET (detail with installments), PUT (update), DELETE (soft delete/cancel)
  - `src/app/api/loans/[id]/installments/route.ts` — GET (list installments), PUT (mark installment as paid, record payment amount/date, recalculate penalties)
  - Auto-generate installments on loan creation using calculation functions
  - Auto-create Transaction entries when payments are recorded
  - Auto-update loan status to PAID_OFF when all installments are paid
  - Files: `src/app/api/loans/route.ts`, `src/app/api/loans/[id]/route.ts`, `src/app/api/loans/[id]/installments/route.ts`
  - Acceptance: Creating a loan generates correct installments; paying an installment updates debt and status

### T005: API Routes — Transactions & Dashboard
- **Blocked By**: [T001, T002]
- **Details**:
  - `src/app/api/transactions/route.ts` — GET (list with month/year/type filters), POST (manual entry/exit)
  - `src/app/api/reports/dashboard/route.ts` — GET aggregated metrics (total lent, received, interest earned, overdue, due today, provisions)
  - `src/app/api/reports/overdue/route.ts` — GET overdue installments with client info
  - `src/app/api/reports/today/route.ts` — GET installments due today
  - `src/app/api/messages/whatsapp/route.ts` — POST generate WhatsApp deep-link URL
  - Files: `src/app/api/transactions/route.ts`, `src/app/api/reports/dashboard/route.ts`, `src/app/api/reports/overdue/route.ts`, `src/app/api/reports/today/route.ts`, `src/app/api/messages/whatsapp/route.ts`
  - Acceptance: Dashboard returns correct aggregated numbers; overdue/today filters work

### T006: Navigation & Layout Updates
- **Blocked By**: []
- **Details**:
  - Update the sidebar navigation (`src/components/app/sidebar.tsx`) to include LoanManager menu items: Dashboard, Empréstimos, Clientes, Lançamentos, Relatórios, Mensagens, Alertas (Vence Hoje, Inadimplentes)
  - Remove or hide AI Chat and Credits menu items that don't apply to LoanManager
  - Update brand config (`src/lib/brand-config.ts`) with LoanManager branding
  - Update landing page content for LoanManager
  - Files: `src/components/app/sidebar.tsx`, `src/lib/brand-config.ts`, `src/app/(public)/page.tsx`
  - Acceptance: Sidebar shows loan management navigation; landing page reflects LoanManager product

### T007: UI Pages — Dashboard
- **Blocked By**: [T005, T006]
- **Details**:
  - Rebuild `src/app/(protected)/dashboard/page.tsx` as LoanManager dashboard
  - Create dashboard components in `src/components/loans/`:
    - `dashboard-metrics.tsx` — KPI cards (Total Emprestado, Total Recebido, Total Devido, Inadimplentes count, Vence Hoje count)
    - `due-today-list.tsx` — Table of installments due today with WhatsApp action button
    - `overdue-list.tsx` — Table of overdue installments
    - `cash-flow-summary.tsx` — Monthly entries/exits summary
  - Filters: by client, by month/year, overdue only, due today only, clear filters
  - Files: `src/app/(protected)/dashboard/page.tsx`, `src/components/loans/dashboard-metrics.tsx`, `src/components/loans/due-today-list.tsx`, `src/components/loans/overdue-list.tsx`, `src/components/loans/cash-flow-summary.tsx`
  - Acceptance: Dashboard loads with real data from API; metrics match expected calculations

### T008: UI Pages — Clients CRUD
- **Blocked By**: [T003, T006]
- **Details**:
  - `src/app/(protected)/clients/page.tsx` — Client list with search and pagination
  - `src/app/(protected)/clients/new/page.tsx` — New client form (all fields from PRD)
  - `src/app/(protected)/clients/[id]/page.tsx` — Client detail: info + list of their loans
  - `src/app/(protected)/clients/[id]/edit/page.tsx` — Edit client form
  - Create form/list components in `src/components/loans/`:
    - `client-form.tsx` — Reusable form for create/edit with CPF mask, phone mask
    - `client-list.tsx` — Table with search, WhatsApp link
  - Files: `src/app/(protected)/clients/page.tsx`, `src/app/(protected)/clients/new/page.tsx`, `src/app/(protected)/clients/[id]/page.tsx`, `src/app/(protected)/clients/[id]/edit/page.tsx`, `src/components/loans/client-form.tsx`, `src/components/loans/client-list.tsx`
  - Acceptance: Can create, view, edit, and delete clients; search works

### T009: UI Pages — Loans CRUD + Installments
- **Blocked By**: [T004, T006]
- **Details**:
  - `src/app/(protected)/loans/page.tsx` — Loan list with filters (client, status, overdue)
  - `src/app/(protected)/loans/new/page.tsx` — Loan creation form: select client, principal, interest rate, interval, installment count, penalty rate; preview generated installments before submit
  - `src/app/(protected)/loans/[id]/page.tsx` — Loan detail: summary cards + installment table with pay/status actions
  - Create components in `src/components/loans/`:
    - `loan-form.tsx` — Loan creation form with installment preview
    - `loan-list.tsx` — Loan table with status badges
    - `installment-table.tsx` — Installment list with pay action, status colors, penalty display
    - `pay-installment-dialog.tsx` — Dialog to record payment (amount, date)
  - Files: `src/app/(protected)/loans/page.tsx`, `src/app/(protected)/loans/new/page.tsx`, `src/app/(protected)/loans/[id]/page.tsx`, `src/components/loans/loan-form.tsx`, `src/components/loans/loan-list.tsx`, `src/components/loans/installment-table.tsx`, `src/components/loans/pay-installment-dialog.tsx`
  - Acceptance: Full loan lifecycle works: create → view installments → pay → auto-update status

### T010: UI Pages — Transactions, Messages & Alerts
- **Blocked By**: [T005, T006]
- **Details**:
  - `src/app/(protected)/transactions/page.tsx` — Transaction list with filters (month, year, type), new entry form
  - `src/app/(protected)/messages/page.tsx` — WhatsApp message composer: select client, editable template with variables, character count, send button (deep-link)
  - `src/app/(protected)/alerts/today/page.tsx` — Installments due today
  - `src/app/(protected)/alerts/overdue/page.tsx` — Overdue installments list
  - Create components:
    - `transaction-form.tsx` — ENTRADA/SAIDA form
    - `transaction-list.tsx` — Filterable transaction table
    - `whatsapp-composer.tsx` — Message template editor with variable substitution
  - Files: `src/app/(protected)/transactions/page.tsx`, `src/app/(protected)/messages/page.tsx`, `src/app/(protected)/alerts/today/page.tsx`, `src/app/(protected)/alerts/overdue/page.tsx`, `src/components/loans/transaction-form.tsx`, `src/components/loans/transaction-list.tsx`, `src/components/loans/whatsapp-composer.tsx`
  - Acceptance: Transactions can be created and filtered; WhatsApp link opens with correct pre-filled message; alerts show correct data

### T011: Landing Page & Branding Update
- **Blocked By**: [T006]
- **Details**:
  - Update `src/app/(public)/page.tsx` and marketing components to present LoanManager:
    - Hero: "Gestão de Empréstimos" headline, subtitle about replacing Excel
    - Features: highlight key modules (Clientes, Empréstimos, Dashboard, WhatsApp, Alertas)
    - Pricing: Single plan R$ 29,90/mês
    - FAQ: Relevant questions about loan management
  - Update `src/app/layout.tsx` metadata (title, description) for LoanManager
  - Files: `src/app/(public)/page.tsx`, `src/app/layout.tsx`, `src/components/marketing/hero.tsx`, `src/components/marketing/pricing.tsx`, `src/components/marketing/features.tsx`
  - Acceptance: Landing page clearly represents LoanManager; pricing shows R$ 29,90/mês plan
