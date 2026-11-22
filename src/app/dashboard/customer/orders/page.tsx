"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errMsg } from "@/lib/api";
import { fmtDate } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog, EmptyState, ErrorState, Img, PageHeader, PageLoader, StatusBadge } from "@/components/shared/common";

export default function CustomerOrders() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["customer-orders", status], queryFn: () => api<{ orders: Order[] }>(`/api/customer/orders${status ? `?status=${status}` : ""}`) });
  const cancel = useMutation({
    mutationFn: (id: string) => api(`/api/customer/orders/${id}/cancel`, { method: "PATCH" }),
    onSuccess: () => { toast.success("Order cancelled"); setCancelId(null); qc.invalidateQueries({ queryKey: ["customer-orders"] }); qc.invalidateQueries({ queryKey: ["customer-overview"] }); },
    onError: (e) => { toast.error(errMsg(e)); setCancelId(null); refetch(); },
  });

  return (
    <>
      <PageHeader title="My Orders" description="Track and manage your orders." action={
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="">All statuses</option>{["pending", "accepted", "rejected", "cancelled"].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </Select>} />
      {isLoading ? <PageLoader /> : error ? <ErrorState error={error} retry={refetch} /> : !data?.orders.length ? (
        <EmptyState title="No orders yet" text="When you order a pizza it will show up here." action={<Button asChild><Link href="/menu">Browse menu</Link></Button>} />
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Restaurant</TableHead><TableHead>Delivery</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell><div className="flex items-center gap-3"><Img src={o.itemImage} alt="" className="h-12 w-12 rounded-xl object-cover" /><span className="max-w-[180px] font-medium">{o.itemName}</span></div></TableCell>
                  <TableCell>{o.vendor?.businessName || o.vendor?.name || "—"}</TableCell>
                  <TableCell><p>{fmtDate(o.deliveryDate)}</p><p className="max-w-[200px] truncate text-xs text-muted-foreground">{o.deliveryAddress}</p></TableCell>
                  <TableCell>{fmtDate(o.createdAt)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline"><Link href={`/dashboard/customer/orders/${o._id}`}>Details</Link></Button>
                    {o.status === "pending" && <Button size="sm" variant="destructive" onClick={() => setCancelId(o._id)}>Cancel</Button>}
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <ConfirmDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)} title="Cancel this order?" description="The restaurant will no longer prepare it. This can't be undone." confirmLabel="Cancel order" destructive loading={cancel.isPending} onConfirm={() => cancelId && cancel.mutate(cancelId)} />
    </>
  );
}
