"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { fmtDateTime, money } from "@/lib/utils";
import type { Paged, Transaction } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, PageHeader, PageLoader, StatusBadge } from "@/components/shared/common";
import { Pager } from "@/components/dashboard/pager";

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const qs = new URLSearchParams({ page: String(page), ...(status ? { status } : {}) }).toString();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["admin-tx", qs], queryFn: () => api<Paged<Transaction>>(`/api/admin/transactions?${qs}`), placeholderData: (p) => p });
  return (
    <>
      <PageHeader title="Transactions" description="Subscription payments. Records are read-only and only change through verified Stripe events." action={
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40" aria-label="Filter by status"><option value="">All statuses</option>{["paid", "pending", "failed", "expired"].map((s) => <option key={s} value={s}>{s}</option>)}</Select>} />
      {isLoading ? <PageLoader /> : error ? <ErrorState error={error} retry={refetch} /> : !data?.items.length ? <EmptyState title="No transactions yet" text="Premium subscription payments will be listed here." /> : (
        <>
          <Card><Table>
            <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>{data.items.map((t) => (
              <TableRow key={t._id}>
                <TableCell><p className="font-medium">{t.vendor?.businessName || t.vendor?.name || "—"}</p><p className="text-xs text-muted-foreground">{t.vendor?.email}</p></TableCell>
                <TableCell className="capitalize">{t.plan}</TableCell>
                <TableCell className="font-semibold">{money(t.amount)} <span className="text-xs uppercase text-muted-foreground">{t.currency}</span></TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className="whitespace-nowrap">{fmtDateTime(t.createdAt)}</TableCell>
              </TableRow>))}
            </TableBody>
          </Table></Card>
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </>
  );
}
