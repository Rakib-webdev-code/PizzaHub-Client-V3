"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Sparkles, UtensilsCrossed, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, PageHeader, PageLoader, StatCard } from "@/components/shared/common";
import { DonutChart, SimpleBar } from "@/components/shared/charts";

export default function VendorOverview() {
  const { data: d, isLoading, error, refetch } = useQuery({ queryKey: ["vendor-overview"], queryFn: () => api<any>("/api/vendor/overview") });
  if (isLoading) return <PageLoader />;
  if (error || !d) return <ErrorState error={error} retry={refetch} />;
  const premium = d.plan === "premium";
  return (
    <>
      <PageHeader title="Vendor Overview" description="How your restaurant is doing." action={<Button asChild><Link href="/dashboard/vendor/items/new">Add menu item</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total menu items" value={d.totalItems} icon={UtensilsCrossed} />
        <StatCard label="Active (approved)" value={d.activeItems} icon={CheckCircle2} hint={d.limit ? `${d.used}/${d.limit} slots used` : "Unlimited slots"} />
        <StatCard label="Pending orders" value={d.pendingOrders} icon={Clock} />
        <StatCard label="Accepted orders" value={d.acceptedOrders} icon={Zap} />
        <StatCard label="Current plan" value={<Badge variant={premium ? "premium" : "muted"} className="text-sm capitalize">{d.plan}</Badge>} icon={Sparkles} hint={premium && d.expiresAt ? `Renews ${fmtDate(d.expiresAt)}` : undefined} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Orders — last 7 days</CardTitle></CardHeader><CardContent><SimpleBar data={d.ordersLast7Days} x="date" y="orders" /></CardContent></Card>
        <Card><CardHeader><CardTitle>Orders by status</CardTitle></CardHeader><CardContent><DonutChart data={d.ordersByStatus} /></CardContent></Card>
      </div>
      {!premium && (
        <Card className="mt-6 border-primary/30 bg-primary/5"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm"><b>Free plan:</b> {d.used} of {d.limit} active items used. Go Premium for unlimited items, a badge and homepage placement.</p>
          <Button asChild size="sm"><Link href="/dashboard/vendor/subscription">Upgrade to Premium</Link></Button>
        </CardContent></Card>
      )}
    </>
  );
}
