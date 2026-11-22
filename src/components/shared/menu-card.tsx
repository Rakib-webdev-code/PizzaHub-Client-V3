import Link from "next/link";
import { MapPin, Star, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Img } from "./common";
import { money } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

// Fixed image ratio + flex column so every card has identical width and height
export function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Img src={item.images?.[0]} alt={item.itemName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {item.vendor?.isPremium && <Badge variant="premium" className="absolute left-3 top-3 shadow">★ Premium</Badge>}
        {!!item.ratingCount && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold shadow">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{item.ratingAvg?.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge variant="secondary" className="w-fit">{item.category}</Badge>
        <h3 className="line-clamp-1 font-display text-lg font-semibold">{item.itemName}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="line-clamp-1">{item.location}</span></p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Store className="h-3.5 w-3.5 shrink-0" /><span className="line-clamp-1">{item.vendor?.businessName || item.vendor?.name}</span></p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-xl font-semibold text-primary">{money(item.price)}</span>
          <Button asChild size="sm"><Link href={`/menu/${item._id}`}>View Details</Link></Button>
        </div>
      </div>
    </article>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
