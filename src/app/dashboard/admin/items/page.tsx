"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { CATEGORIES, money } from "@/lib/utils";
import type { MenuItem, Paged } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog, EmptyState, ErrorState, Img, PageHeader, PageLoader, StatusBadge } from "@/components/shared/common";
import { Pager } from "@/components/dashboard/pager";

export default function ManageItems() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [del, setDel] = useState<MenuItem | null>(null);
  useEffect(() => { const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 350); return () => clearTimeout(t); }, [search]);

  const qs = new URLSearchParams({ page: String(page), ...(q ? { search: q } : {}), ...(status ? { status } : {}), ...(category ? { category } : {}) }).toString();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["admin-items", qs], queryFn: () => api<Paged<MenuItem>>(`/api/admin/menu-items?${qs}`), placeholderData: (p) => p });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-items"] }); qc.invalidateQueries({ queryKey: ["admin-overview"] }); };
  const setStatusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api(`/api/admin/menu-items/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: (_r, v) => { toast.success(`Item marked ${v.status}`); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/admin/menu-items/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Menu item deleted"); setDel(null); refresh(); },
    onError: (e) => { toast.error(errMsg(e)); setDel(null); },
  });
  const busy = (id: string) => setStatusM.isPending && setStatusM.variables?.id === id;

  return (
    <>
      <PageHeader title="Manage Menu Items" description="Review submissions and control what is public. Only approved items appear on the menu." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search name or location" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" aria-label="Search items" />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40" aria-label="Filter by status"><option value="">All statuses</option>{["pending", "approved", "rejected", "inactive"].map((s) => <option key={s} value={s}>{s}</option>)}</Select>
        <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-56" aria-label="Filter by category"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</Select>
      </div>
      {isLoading ? <PageLoader /> : error ? <ErrorState error={error} retry={refetch} /> : !data?.items.length ? <EmptyState title="No items found" text="Try changing the filters." /> : (
        <>
          <Card><Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Vendor</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{data.items.map((it) => (
              <TableRow key={it._id}>
                <TableCell><div className="flex items-center gap-3"><Img src={it.images?.[0]} alt="" className="h-12 w-12 rounded-xl object-cover" /><div><p className="font-medium">{it.itemName}</p><p className="text-xs text-muted-foreground">{it.category} · {it.location}</p></div></div></TableCell>
                <TableCell>{it.vendor?.businessName || it.vendor?.name || "—"}</TableCell>
                <TableCell className="font-semibold">{money(it.price)}</TableCell>
                <TableCell><StatusBadge status={it.status} /></TableCell>
                <TableCell><div className="flex flex-wrap justify-end gap-1.5">
                  {it.status === "approved" && <Button asChild size="sm" variant="ghost"><Link href={`/menu/${it._id}`}>View</Link></Button>}
                  {(it.status === "pending" || it.status === "rejected" || it.status === "inactive") && <Button size="sm" variant="success" disabled={busy(it._id)} onClick={() => setStatusM.mutate({ id: it._id, status: "approved" })}><Check />Approve</Button>}
                  {(it.status === "pending" || it.status === "approved") && <Button size="sm" variant="outline" disabled={busy(it._id)} onClick={() => setStatusM.mutate({ id: it._id, status: it.status === "pending" ? "rejected" : "inactive" })}><X />{it.status === "pending" ? "Reject" : "Deactivate"}</Button>}
                  {it.status === "approved" && <Button size="sm" variant="outline" disabled={busy(it._id)} onClick={() => setStatusM.mutate({ id: it._id, status: "rejected" })}>Reject</Button>}
                  <Button size="icon" variant="destructive" className="h-8 w-8" aria-label="Delete item" onClick={() => setDel(it)}><Trash2 /></Button>
                </div></TableCell>
              </TableRow>))}
            </TableBody>
          </Table></Card>
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete this item?" description={`"${del?.itemName}" will be permanently removed from the platform.`} confirmLabel="Delete" destructive loading={remove.isPending} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}
