"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/utils";
import type { MenuItem, Paged } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/shared/common";
import { MenuCard, MenuCardSkeleton } from "@/components/shared/menu-card";

function Browse() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const get = (k: string) => sp.get(k) ?? "";
  const [search, setSearch] = useState(get("search"));

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, v); else p.delete(k);
    if (k !== "page") p.delete("page");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };
  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { if (search !== get("search")) setParam("search", search.trim()); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const qs = sp.toString();
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["menu", qs],
    queryFn: () => api<Paged<MenuItem>>(`/api/menu?${qs}&limit=12`, { auth: false }),
    placeholderData: (prev) => prev,
  });
  const { data: locs } = useQuery({ queryKey: ["locations"], queryFn: () => api<{ locations: string[] }>("/api/menu/locations", { auth: false }) });
  const page = Number(get("page") || 1);
  const hasFilters = ["search", "category", "location", "minPrice", "maxPrice", "sort"].some((k) => get(k));

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="section-title">Browse Menu</h1>
        <p className="section-lead">Search every approved pizza, side and drink from local restaurants.</p>
      </div>

      <div className="mb-8 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pizza, ingredient or area" className="pl-10" aria-label="Search menu" />
        </div>
        <Select value={get("category")} onChange={(e) => setParam("category", e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </Select>
        <Select value={get("location")} onChange={(e) => setParam("location", e.target.value)} aria-label="Location">
          <option value="">All locations</option>
          {(locs?.locations ?? []).map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Select value={get("sort")} onChange={(e) => setParam("sort", e.target.value)} aria-label="Sort by">
          <option value="">Featured first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </Select>
        <div className="flex gap-2">
          <Input type="number" min={0} placeholder="Min $" defaultValue={get("minPrice")} key={`min${get("minPrice")}`} onBlur={(e) => setParam("minPrice", e.target.value)} aria-label="Minimum price" />
          <Input type="number" min={0} placeholder="Max $" defaultValue={get("maxPrice")} key={`max${get("maxPrice")}`} onBlur={(e) => setParam("maxPrice", e.target.value)} aria-label="Maximum price" />
        </div>
      </div>

      {hasFilters && (
        <div className="mb-5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{data ? `${data.total} result${data.total === 1 ? "" : "s"}` : ""}</span>
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); router.replace(pathname); }}><RotateCcw />Clear filters</Button>
        </div>
      )}

      {error ? <ErrorState error={error} retry={refetch} title="Couldn't load the menu" /> : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <MenuCardSkeleton key={i} />)}</div>
      ) : !data?.items.length ? (
        <EmptyState title="No items match your search" text="Try a different keyword, category or price range." action={<Button variant="outline" onClick={() => { setSearch(""); router.replace(pathname); }}>Reset filters</Button>} />
      ) : (
        <>
          <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isFetching ? "opacity-70 transition-opacity" : ""}`}>
            {data.items.map((it) => <MenuCard key={it._id} item={it} />)}
          </div>
          {data.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}><ChevronLeft />Previous</Button>
              <span className="text-sm text-muted-foreground">Page {data.page} of {data.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setParam("page", String(page + 1))}>Next<ChevronRight /></Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MenuPage() {
  return <Suspense fallback={null}><Browse /></Suspense>;
}
