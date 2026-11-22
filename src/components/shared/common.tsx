"use client";
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Inbox, Loader2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#f6e7cf'/><circle cx='200' cy='150' r='70' fill='#e8a84c'/><circle cx='200' cy='150' r='56' fill='#d63a1f'/><circle cx='200' cy='150' r='48' fill='#f6d276'/><circle cx='180' cy='135' r='9' fill='#b3261e'/><circle cx='215' cy='160' r='9' fill='#b3261e'/><circle cx='195' cy='175' r='7' fill='#b3261e'/></svg>`);

export function Img({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [bad, setBad] = React.useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={bad || !src ? FALLBACK : src} alt={alt} loading="lazy" onError={() => setBad(true)} className={className} />;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-primary", className)} aria-label="Loading" />;
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4"><Inbox className="h-6 w-6 text-primary" /></div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, retry, title = "Something went wrong" }: { error?: unknown; retry?: () => void; title?: string }) {
  const msg = error instanceof Error ? error.message : "Please try again.";
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center" role="alert">
      <AlertTriangle className="mb-3 h-8 w-8 text-destructive" />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{msg}</p>
      {retry && <Button variant="outline" className="mt-5" onClick={retry}>Try again</Button>}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold leading-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS: Record<string, { v: "success" | "warning" | "danger" | "muted"; label?: string }> = {
  pending: { v: "warning" }, approved: { v: "success" }, accepted: { v: "success" }, paid: { v: "success" },
  rejected: { v: "danger" }, failed: { v: "danger" }, cancelled: { v: "muted" }, inactive: { v: "muted" }, expired: { v: "muted" }, free: { v: "muted" },
};
export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { v: "muted" as const };
  return <Badge variant={s.v} className="capitalize">{s.label ?? status}</Badge>;
}

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
      ))}
    </span>
  );
}

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = "Confirm", destructive, loading, onConfirm,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel?: string;
  destructive?: boolean; loading?: boolean; onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep it</Button>
          <Button variant={destructive ? "destructive" : "default"} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const BackLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">{children}</Link>
);
