"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Circle, CreditCard, XCircle } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { fmtDate, fmtDateTime, money } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog, ErrorState, Img, PageLoader, StatusBadge } from "@/components/shared/common";

const LABEL: Record<string, string> = { pending: "Order placed", accepted: "Accepted by restaurant", rejected: "Rejected by restaurant", cancelled: "Cancelled by you" };

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["customer-order", id], queryFn: () => api<{ order: Order }>(`/api/customer/orders/${id}`), retry: false });
  const cancel = useMutation({
    mutationFn: () => api(`/api/customer/orders/${id}/cancel`, { method: "PATCH" }),
    onSuccess: () => { toast.success("Order cancelled"); setConfirm(false); qc.invalidateQueries({ queryKey: ["customer-order", id] }); qc.invalidateQueries({ queryKey: ["customer-orders"] }); qc.invalidateQueries({ queryKey: ["customer-overview"] }); },
    onError: (e) => { toast.error(errMsg(e)); setConfirm(false); },
  });
  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState error={error} retry={refetch} title="Order not found" />;
  const o = data.order;
  const history = o.history?.length ? o.history : [{ status: o.status, at: o.createdAt }];
  const open = o.status === "pending";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/customer/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to orders</Link>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Img src={o.itemImage} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1"><h1 className="font-display text-xl font-semibold">{o.itemName}</h1><p className="text-sm text-muted-foreground">{o.vendor?.businessName || o.vendor?.name} · {money(o.price)}</p></div>
          <StatusBadge status={o.status} />
        </CardContent>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Delivery</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="text-muted-foreground">Date:</span> {fmtDate(o.deliveryDate)}</p><p><span className="text-muted-foreground">Address:</span> {o.deliveryAddress}</p>{o.message && <p><span className="text-muted-foreground">Note:</span> {o.message}</p>}<p><span className="text-muted-foreground">Requested:</span> {fmtDateTime(o.createdAt)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Order timeline</CardTitle></CardHeader><CardContent>
          <ol className="space-y-4">
            {history.map((h, i) => {
              const bad = h.status === "rejected" || h.status === "cancelled";
              return (
                <li key={i} className="flex gap-3">
                  {bad ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-basil" />}
                  <div><p className="text-sm font-medium">{LABEL[h.status] ?? h.status}</p><p className="text-xs text-muted-foreground">{fmtDateTime(h.at)}</p></div>
                </li>
              );
            })}
            {open && <li className="flex gap-3"><Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Waiting for the restaurant to respond</p></li>}
          </ol>
        </CardContent></Card>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {(open || o.status === "accepted") && <Button onClick={() => toast.info("Online payment isn't enabled yet — you can pay on delivery.")}><CreditCard />Pay now</Button>}
        {open && <Button variant="destructive" onClick={() => setConfirm(true)}>Cancel order</Button>}
      </div>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Cancel this order?" description="The restaurant will no longer prepare it. This can't be undone." confirmLabel="Cancel order" destructive loading={cancel.isPending} onConfirm={() => cancel.mutate()} />
    </div>
  );
}
