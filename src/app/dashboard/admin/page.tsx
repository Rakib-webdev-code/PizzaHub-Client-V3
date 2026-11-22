"use client";
import { useQuery } from "@tanstack/react-query";
import { Clock, Receipt, ShieldCheck, Store, UserRound, Users, UtensilsCrossed } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, PageHeader, PageLoader, StatCard } from "@/components/shared/common";
import { DonutChart, SimpleBar } from "@/components/shared/charts";

export default function AdminOverview() {
  const { data: d, isLoading, error, refetch } = useQuery({ queryKey: ["admin-overview"], queryFn: () => api<any>("/api/admin/overview") });
  if (isLoading) return <PageLoader />;
  if (error || !d) return <ErrorState error={error} retry={refetch} />;
  return (
    <>
      <PageHeader title="Admin Overview" description="Platform health at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Registered users" value={d.totalUsers} icon={Users} />
        <StatCard label="Vendors" value={d.totalVendors} icon={Store} />
        <StatCard label="Customers" value={d.totalCustomers} icon={UserRound} />
        <StatCard label="Menu items" value={d.totalMenuItems} icon={UtensilsCrossed} />
        <StatCard label="Pending menu items" value={d.pendingMenuItems} icon={Clock} />
        <StatCard label="Transactions" value={d.totalTransactions} icon={Receipt} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Users by role</CardTitle></CardHeader><CardContent><DonutChart data={d.usersByRole} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Menu items by status</CardTitle></CardHeader><CardContent><DonutChart data={d.itemsByStatus} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Revenue by month (USD)</CardTitle></CardHeader><CardContent><SimpleBar data={d.revenueByMonth} x="month" y="revenue" color="#f08a24" /></CardContent></Card>
      </div>
    </>
  );
}
