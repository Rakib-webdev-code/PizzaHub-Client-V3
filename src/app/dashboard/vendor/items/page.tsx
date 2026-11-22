"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { ApiError, api, errMsg } from "@/lib/api";
import { money } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog, EmptyState, ErrorState, Img, PageHeader, PageLoader, StatusBadge } from "@/components/shared/common";

export default function VendorItems() {
  const qc = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [del, setDel] = useState<MenuItem | null>(null);
  const qs = new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}) }).toString();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["vendor-items", qs], queryFn: () => api<{ items: MenuItem[] }>(`/api/vendor/items?${qs}`) });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["vendor-items"] }); qc.invalidateQueries({ queryKey: ["vendor-overview"] }); };

  const toggle = useMutation({
    mutationFn: (id: string) => api<{ message: string }>(`/api/vendor/items/${id}/availability`, { method: "PATCH" }),
    onSuccess: (r) => { toast.success(r.message); refresh(); },
    onError: (e) => {
      if (e instanceof ApiError && e.code === "PREMIUM_REQUIRED") toast.error(e.message, { action: { label: "Upgrade", onClick: () => router.push("/dashboard/vendor/subscription") } });
      else toast.error(errMsg(e));
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/vendor/items/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Menu item deleted"); setDel(null); refresh(); },
    onError: (e) => { toast.error(errMsg(e)); setDel(null); },
  });

  return (
    <>
      <PageHeader title="My Menu Items" description="Manage what customers can order." action={<Button asChild><Link href="/dashboard/vendor/items/new">Add menu item</Link></Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" aria-label="Search items" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44" aria-label="Filter by status">
          <option value="">All statuses</option>{["pending", "approved", "rejected", "inactive"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      {isLoading ? <PageLoader /> : error ? <ErrorState error={error} retry={refetch} /> : !data?.items.length ? (
        <EmptyState title="No menu items" text="Add your first item — it goes live after admin approval." action={<Button asChild><Link href="/dashboard/vendor/items/new">Add menu item</Link></Button>} />
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.items.map((it) => (
                <TableRow key={it._id}>
                  <TableCell><div className="flex items-center gap-3"><Img src={it.images?.[0]} alt="" className="h-12 w-12 rounded-xl object-cover" /><div><p className="font-medium">{it.itemName}</p><p className="text-xs text-muted-foreground">{it.location}</p></div></div></TableCell>
                  <TableCell className="whitespace-nowrap">{it.category}</TableCell>
                  <TableCell className="font-semibold">{money(it.price)}</TableCell>
                  <TableCell><StatusBadge status={it.status} />{it.status === "rejected" && <p className="mt-1 text-xs text-muted-foreground">Hidden from customers</p>}</TableCell>
                  <TableCell><div className="flex justify-end gap-1.5">
                    {it.status === "approved" && <Button asChild size="sm" variant="ghost"><Link href={`/menu/${it._id}`}>View</Link></Button>}
                    <Button asChild size="sm" variant="outline" aria-label="Edit"><Link href={`/dashboard/vendor/items/${it._id}/edit`}><Pencil />Edit</Link></Button>
                    {it.status !== "rejected" && (
                      <Button size="sm" variant="outline" loading={toggle.isPending && toggle.variables === it._id} onClick={() => toggle.mutate(it._id)} title={it.status === "inactive" ? "Make available" : "Make unavailable"}>
                        {it.status === "inactive" ? <Eye /> : <EyeOff />}{it.status === "inactive" ? "Enable" : "Disable"}
                      </Button>
                    )}
                    <Button size="icon" variant="destructive" className="h-8 w-8" aria-label="Delete" onClick={() => setDel(it)}><Trash2 /></Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete this menu item?" description={`"${del?.itemName}" will be permanently removed.`} confirmLabel="Delete" destructive loading={remove.isPending} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}
