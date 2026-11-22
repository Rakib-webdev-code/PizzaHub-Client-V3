"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Crown } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { fmtDate, money } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog, ErrorState, PageHeader, PageLoader, StatusBadge } from "@/components/shared/common";

type Status = { plan: "free" | "premium"; expiresAt: string | null; cancelAtPeriodEnd: boolean; freeLimit: number; price: number; transactions: Transaction[] };

export default function Subscription() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["subscription"], queryFn: () => api<Status>("/api/subscription/status") });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["subscription"] }); qc.invalidateQueries({ queryKey: ["me"] }); };

  const checkout = useMutation({
    mutationFn: () => api<{ url: string }>("/api/subscription/checkout", { method: "POST" }),
    onSuccess: (r) => { window.location.href = r.url; },
    onError: (e) => toast.error(errMsg(e)),
  });
  const cancel = useMutation({
    mutationFn: () => api<{ message: string }>("/api/subscription/cancel", { method: "POST" }),
    onSuccess: (r) => { toast.success(r.message); setConfirm(false); refresh(); },
    onError: (e) => { toast.error(errMsg(e)); setConfirm(false); },
  });
  const resume = useMutation({
    mutationFn: () => api<{ message: string }>("/api/subscription/resume", { method: "POST" }),
    onSuccess: (r) => { toast.success(r.message); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState error={error} retry={refetch} />;
  const premium = data.plan === "premium";
  const FREE = [`Up to ${data.freeLimit} active menu items`, "Basic vendor dashboard", "Order management"];
  const PREMIUM = ["Unlimited active menu items", "Premium vendor badge", "Featured placement on the homepage", "All Free features"];

  return (
    <>
      <PageHeader title="Subscription" description="Choose the plan that fits your restaurant." />
      <div className="grid max-w-4xl gap-5 md:grid-cols-2">
        <Card className={!premium ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Free</CardTitle>{!premium && <Badge>Current plan</Badge>}</div><CardDescription>Get started at no cost</CardDescription></CardHeader>
          <CardContent><p className="font-display text-4xl font-semibold">$0</p>
            <ul className="mt-5 space-y-2.5 text-sm">{FREE.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-basil" />{f}</li>)}</ul></CardContent>
        </Card>
        <Card className={premium ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-accent" />Premium</CardTitle>{premium && <Badge variant="premium">Current plan</Badge>}</div><CardDescription>Grow with more visibility</CardDescription></CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-semibold">{money(data.price)}<span className="text-base font-normal text-muted-foreground"> / month</span></p>
            <ul className="mt-5 space-y-2.5 text-sm">{PREMIUM.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-basil" />{f}</li>)}</ul>
            <div className="mt-6">
              {!premium || data.cancelAtPeriodEnd ? (
                premium ? <Button variant="outline" loading={resume.isPending} onClick={() => resume.mutate()}>Keep my subscription</Button>
                  : <Button size="lg" className="w-full" loading={checkout.isPending} onClick={() => checkout.mutate()}>Upgrade to Premium</Button>
              ) : <Button variant="outline" onClick={() => setConfirm(true)}>Cancel subscription</Button>}
              {premium && <p className="mt-3 text-xs text-muted-foreground">{data.cancelAtPeriodEnd ? `Ends on ${fmtDate(data.expiresAt)}. You keep Premium until then.` : `Renews on ${fmtDate(data.expiresAt)}.`}</p>}
              {!premium && <p className="mt-3 text-xs text-muted-foreground">Secure checkout by Stripe. Premium activates once the payment is confirmed.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 mt-10 font-display text-xl font-semibold">Payment history</h2>
      {!data.transactions.length ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
        <Card className="max-w-4xl"><Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{data.transactions.map((t) => (
            <TableRow key={t._id}><TableCell>{fmtDate(t.createdAt)}</TableCell><TableCell className="capitalize">{t.plan}</TableCell><TableCell>{money(t.amount)}</TableCell><TableCell><StatusBadge status={t.status} /></TableCell></TableRow>
          ))}</TableBody>
        </Table></Card>
      )}
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Cancel Premium?" description="You'll keep Premium until the end of the current billing period, then return to the Free plan (3 active items)." confirmLabel="Cancel subscription" destructive loading={cancel.isPending} onConfirm={() => cancel.mutate()} />
    </>
  );
}
