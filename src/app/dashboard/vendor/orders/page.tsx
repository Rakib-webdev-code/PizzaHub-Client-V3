"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { fmtDate, money } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog, EmptyState, ErrorState, Img, PageHeader, PageLoader, StatusBadge } from "@/components/shared/common";

export default function VendorOrders() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [reject, setReject] = useState<Order | null>(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["vendor-orders", status], queryFn: () => api<{ orders: Order[] }>(`/api/vendor/orders${status ? `?status=${status}` : ""}`) });
  const act = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "accepted" | "rejected" }) => api(`/api/vendor/orders/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: (_r, v) => { toast.success(`Order ${v.status}`); setReject(null); qc.invalidateQueries({ queryKey: ["vendor-orders"] }); qc.invalidateQueries({ queryKey: ["vendor-overview"] }); },
    onError: (e) => { toast.error(errMsg(e)); setReject(null); refetch(); },
  });
  const busy = (id: string) => act.isPending && act.variables?.id === id;

  return (
    <>
      <PageHeader title="Customer Orders" description="Accept or reject incoming orders. Each pending order can be decided once." action={
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40" aria-label="Filter by status">
          <option value="">All statuses</option>{["pending", "accepted", "rejected", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>} />
      {isLoading ? <PageLoader /> : error ? <ErrorState error={error} retry={refetch} /> : !data?.orders.length ? (
        <EmptyState title="No orders yet" text="Orders from customers will show up here." />
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Item</TableHead><TableHead>Delivery</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell><div className="flex items-center gap-2.5"><UserAvatar name={o.customer?.name} src={o.customer?.image} /><div><p className="font-medium">{o.customer?.name}</p><p className="text-xs text-muted-foreground">{o.customer?.email}</p></div></div></TableCell>
                  <TableCell><div className="flex items-center gap-2.5"><Img src={o.itemImage} alt="" className="h-11 w-11 rounded-xl object-cover" /><div><p className="font-medium">{o.itemName}</p><p className="text-xs text-muted-foreground">{money(o.price)}</p></div></div></TableCell>
                  <TableCell><p className="whitespace-nowrap">{fmtDate(o.deliveryDate)}</p><p className="max-w-[220px] text-xs text-muted-foreground">{o.deliveryAddress}</p></TableCell>
                  <TableCell className="max-w-[200px] text-muted-foreground">{o.message || "—"}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-right">
                    {o.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="success" loading={busy(o._id) && act.variables?.status === "accepted"} disabled={busy(o._id)} onClick={() => act.mutate({ id: o._id, status: "accepted" })}><Check />Accept</Button>
                        <Button size="sm" variant="destructive" disabled={busy(o._id)} onClick={() => setReject(o)}><X />Reject</Button>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Decided</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <ConfirmDialog open={!!reject} onOpenChange={(o) => !o && setReject(null)} title="Reject this order?" description={`${reject?.customer?.name} will be notified. You can't change this later.`} confirmLabel="Reject order" destructive loading={act.isPending} onConfirm={() => reject && act.mutate({ id: reject._id, status: "rejected" })} />
    </>
  );
}
