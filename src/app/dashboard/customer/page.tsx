"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Heart, ShoppingBag, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, PageHeader, PageLoader, StatCard } from "@/components/shared/common";
import { DonutChart } from "@/components/shared/charts";

export default function CustomerOverview() {
  const { me } = useMe();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["customer-overview"], queryFn: () => api<any>("/api/customer/overview") });
  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState error={error} retry={refetch} />;
  return (
    <>
      <PageHeader title={`Hi ${me?.name.split(" ")[0] ?? "there"} 👋`} description="Here's a snapshot of your orders." action={<Button asChild><Link href="/menu">Order pizza</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={data.total} icon={ShoppingBag} />
        <StatCard label="Pending" value={data.pending} icon={Clock} />
        <StatCard label="Accepted" value={data.accepted} icon={CheckCircle2} />
        <StatCard label="Rejected" value={data.rejected} icon={XCircle} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Orders by status</CardTitle></CardHeader><CardContent><DonutChart data={{ pending: data.pending, accepted: data.accepted, rejected: data.rejected, cancelled: data.cancelled }} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Favorites</CardTitle></CardHeader><CardContent className="flex flex-col items-center gap-3 py-8 text-center"><Heart className="h-10 w-10 text-primary" /><p className="font-display text-3xl font-semibold">{data.favorites}</p><Button asChild variant="outline" size="sm"><Link href="/dashboard/customer/favorites">View favorites</Link></Button></CardContent></Card>
      </div>
    </>
  );
}
