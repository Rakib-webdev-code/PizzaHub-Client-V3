"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, CheckCircle, Eye } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { fmtDate } from "@/lib/utils";
import type { Paged } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog, EmptyState, ErrorState, PageHeader, PageLoader } from "@/components/shared/common";
import { Pager } from "@/components/dashboard/pager";

type U = { _id: string; name: string; email: string; image?: string; role: string; isBlocked?: boolean; businessName?: string; subscriptionPlan?: string; subscriptionExpiresAt?: string; createdAt: string };

function Details({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useQuery({ queryKey: ["admin-user", id], queryFn: () => api<{ user: U; stats: Record<string, number> }>(`/api/admin/users/${id}`), enabled: !!id });
  const u = data?.user;
  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>User details</DialogTitle></DialogHeader>
        {isLoading || !u ? <PageLoader /> : (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3"><UserAvatar name={u.name} src={u.image} className="h-14 w-14" /><div><p className="font-semibold">{u.name}</p><p className="text-muted-foreground">{u.email}</p></div></div>
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-muted-foreground">Role</dt><dd className="font-medium capitalize">{u.role}</dd></div>
              <div><dt className="text-muted-foreground">Joined</dt><dd className="font-medium">{fmtDate(u.createdAt)}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd className="font-medium">{u.isBlocked ? "Blocked" : "Active"}</dd></div>
              {u.role === "vendor" && <><div><dt className="text-muted-foreground">Restaurant</dt><dd className="font-medium">{u.businessName || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Plan</dt><dd className="font-medium capitalize">{u.subscriptionPlan || "free"}</dd></div>
                <div><dt className="text-muted-foreground">Menu items</dt><dd className="font-medium">{data?.stats.items}</dd></div>
                <div><dt className="text-muted-foreground">Orders received</dt><dd className="font-medium">{data?.stats.ordersAsVendor}</dd></div>
                <div><dt className="text-muted-foreground">Paid payments</dt><dd className="font-medium">{data?.stats.payments}</dd></div></>}
              {u.role === "customer" && <div><dt className="text-muted-foreground">Orders placed</dt><dd className="font-medium">{data?.stats.ordersAsCustomer}</dd></div>}
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ManageUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<string | null>(null);
  const [target, setTarget] = useState<U | null>(null);
  useEffect(() => { const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 350); return () => clearTimeout(t); }, [search]);

  const qs = new URLSearchParams({ page: String(page), ...(q ? { search: q } : {}), ...(role ? { role } : {}) }).toString();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["admin-users", qs], queryFn: () => api<Paged<U>>(`/api/admin/users?${qs}`), placeholderData: (p) => p });
  const block = useMutation({
    mutationFn: (u: U) => api<{ message: string }>(`/api/admin/users/${u._id}/block`, { method: "PATCH", body: { blocked: !u.isBlocked } }),
    onSuccess: (r) => { toast.success(r.message); setTarget(null); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e) => { toast.error(errMsg(e)); setTarget(null); },
  });

  return (
    <>
      <PageHeader title="Manage Users" description="Search, inspect and block or unblock accounts." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" aria-label="Search users" />
        <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="w-40" aria-label="Filter by role">
          <option value="">All roles</option><option value="vendor">Vendors</option><option value="customer">Customers</option><option value="admin">Admins</option>
        </Select>
      </div>
      {isLoading ? <PageLoader /> : error ? <ErrorState error={error} retry={refetch} /> : !data?.items.length ? <EmptyState title="No users found" text="Try another search or role filter." /> : (
        <>
          <Card><Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{data.items.map((u) => (
              <TableRow key={u._id}>
                <TableCell><div className="flex items-center gap-3"><UserAvatar name={u.name} src={u.image} /><div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div></TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                <TableCell>{fmtDate(u.createdAt)}</TableCell>
                <TableCell><Badge variant={u.isBlocked ? "danger" : "success"}>{u.isBlocked ? "Blocked" : "Active"}</Badge></TableCell>
                <TableCell><div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setView(u._id)}><Eye />Details</Button>
                  {u.role !== "admin" && (u.isBlocked
                    ? <Button size="sm" variant="success" onClick={() => setTarget(u)}><CheckCircle />Unblock</Button>
                    : <Button size="sm" variant="destructive" onClick={() => setTarget(u)}><Ban />Block</Button>)}
                </div></TableCell>
              </TableRow>))}
            </TableBody>
          </Table></Card>
          <Pager page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
      <Details id={view} onClose={() => setView(null)} />
      <ConfirmDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)} title={target?.isBlocked ? "Unblock this user?" : "Block this user?"}
        description={target?.isBlocked ? `${target?.name} will regain access to protected features.` : `${target?.name} will be signed out and lose access to protected features. Their menu items disappear from the public menu.`}
        confirmLabel={target?.isBlocked ? "Unblock" : "Block user"} destructive={!target?.isBlocked} loading={block.isPending} onConfirm={() => target && block.mutate(target)} />
    </>
  );
}
