"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, PageHeader } from "@/components/shared/common";
import { MenuCard, MenuCardSkeleton } from "@/components/shared/menu-card";

export default function Favorites() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["favorites"], queryFn: () => api<{ items: MenuItem[] }>("/api/customer/favorites") });
  return (
    <>
      <PageHeader title="Favorites" description="Items you've saved for later." />
      {error ? <ErrorState error={error} retry={refetch} /> : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <MenuCardSkeleton key={i} />)}</div>
      ) : !data?.items.length ? (
        <EmptyState title="No favorites yet" text="Tap Save on any menu item to keep it here." action={<Button asChild><Link href="/menu">Browse menu</Link></Button>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((it) => <MenuCard key={it._id} item={it} />)}</div>
      )}
    </>
  );
}
