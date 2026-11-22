"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, CreditCard, Heart, MapPin, ShoppingBag, Star, Store } from "lucide-react";
import { ApiError, api, errMsg } from "@/lib/api";
import { fmtDate, money } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";
import { useMe } from "@/hooks/use-me";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui/avatar";
import { ErrorState, Img, PageLoader, Stars } from "@/components/shared/common";

type ItemState = { favorite: boolean; canReview: boolean; myReview: { rating: number; comment: string } | null };

function OrderDialog({ item, open, onOpenChange }: { item: MenuItem; open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const today = new Date().toLocaleDateString("en-CA");
  const [form, setForm] = useState({ deliveryDate: today, deliveryAddress: "", message: "" });
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const place = useMutation({
    mutationFn: () => api("/api/customer/orders", { method: "POST", body: { itemId: item._id, ...form } }),
    onSuccess: () => { setPlaced(true); toast.success("Order placed! The restaurant will review it shortly."); qc.invalidateQueries({ queryKey: ["customer-orders"] }); qc.invalidateQueries({ queryKey: ["customer-overview"] }); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.deliveryDate || form.deliveryDate < today) er.deliveryDate = "Choose today or a future date";
    if (form.deliveryAddress.trim().length < 8) er.deliveryAddress = "Enter your full delivery address";
    setErrors(er);
    if (!Object.keys(er).length) place.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setTimeout(() => setPlaced(false), 200); }}>
      <DialogContent>
        {placed ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-basil" />
            <h2 className="mt-3 font-display text-2xl font-semibold">Order placed</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.itemName} · {fmtDate(form.deliveryDate)}. We&apos;ll email you when the restaurant responds.</p>
            <div className="mt-6 grid gap-2">
              {/* Online payment for food orders is intentionally just a button (no Stripe here) */}
              <Button size="lg" onClick={() => toast.info("Online payment isn't enabled yet — you can pay on delivery.")}><CreditCard />Pay now · {money(item.price)}</Button>
              <Button asChild variant="outline"><Link href="/dashboard/customer/orders">Track my orders</Link></Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>Order {item.itemName}</DialogTitle>
              <DialogDescription>{money(item.price)} · from {item.vendor?.businessName || item.vendor?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="date">Delivery date</Label>
              <Input id="date" type="date" min={today} value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} />
              {errors.deliveryDate && <p className="text-xs text-destructive">{errors.deliveryDate}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addr">Delivery address</Label>
              <Textarea id="addr" rows={2} placeholder="House, road, area, city" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
              {errors.deliveryAddress && <p className="text-xs text-destructive">{errors.deliveryAddress}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="msg">Special instructions <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Textarea id="msg" rows={2} maxLength={300} placeholder="Extra spicy, ring the bell twice…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <DialogFooter><Button type="submit" size="lg" loading={place.isPending}>Confirm order</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({ itemId, existing }: { itemId: string; existing: { rating: number; comment: string } | null }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const save = useMutation({
    mutationFn: () => api(`/api/customer/reviews/${itemId}`, { method: "POST", body: { rating, comment } }),
    onSuccess: () => { toast.success("Review saved"); qc.invalidateQueries({ queryKey: ["item", itemId] }); qc.invalidateQueries({ queryKey: ["item-state", itemId] }); },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <div className="mb-6 rounded-2xl border bg-secondary/40 p-4">
      <p className="mb-2 text-sm font-semibold">{existing ? "Update your review" : "Rate this item"}</p>
      <div className="mb-3 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)} className="rounded p-0.5 focus-visible:ring-2 focus-visible:ring-ring">
            <Star className={`h-7 w-7 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
          </button>
        ))}
      </div>
      <Textarea rows={2} maxLength={500} placeholder="Share what you liked (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button className="mt-3" size="sm" disabled={!rating} loading={save.isPending} onClick={() => save.mutate()}>Submit review</Button>
    </div>
  );
}

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { me, role, isAuthed, loading } = useMe();
  const [active, setActive] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthed) router.replace(`/signin?redirect=${encodeURIComponent(`/menu/${id}`)}`);
  }, [loading, isAuthed, id, router]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["item", id],
    queryFn: () => api<{ item: MenuItem }>(`/api/menu/${id}`, { auth: false }),
    retry: false,
  });
  const isCustomer = role === "customer";
  const { data: state } = useQuery({ queryKey: ["item-state", id], queryFn: () => api<ItemState>(`/api/customer/item-state/${id}`), enabled: isCustomer });

  const fav = useMutation({
    mutationFn: (on: boolean) => api(`/api/customer/favorites/${id}`, { method: on ? "PUT" : "DELETE" }),
    onSuccess: (_d, on) => { toast.success(on ? "Added to favorites" : "Removed from favorites"); qc.invalidateQueries({ queryKey: ["item-state", id] }); qc.invalidateQueries({ queryKey: ["favorites"] }); },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (loading || !isAuthed || isLoading) return <PageLoader label="Loading item…" />;
  if (error || !data) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return (
      <div className="container py-16">
        <ErrorState title={notFound ? "Item not found" : "Couldn't load this item"} error={error} retry={notFound ? undefined : refetch} />
        <div className="mt-6 text-center"><Button asChild variant="outline"><Link href="/menu"><ArrowLeft />Back to menu</Link></Button></div>
      </div>
    );
  }
  const item = data.item;
  const ownItem = me?.id === item.vendorId || me?.id === item.vendor?.id;

  return (
    <div className="container py-10">
      <Link href="/menu" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to menu</Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl border bg-muted"><Img src={item.images[active]} alt={item.itemName} className="h-full w-full object-cover" /></div>
          {item.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {item.images.map((src, i) => (
                <button key={src + i} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={`aspect-[4/3] overflow-hidden rounded-xl border-2 ${i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  <Img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{item.category}</Badge>{item.vendor?.isPremium && <Badge variant="premium">★ Premium</Badge>}</div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{item.itemName}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <Stars value={item.ratingAvg ?? 0} />
            <span className="text-muted-foreground">{item.ratingCount ? `${item.ratingAvg?.toFixed(1)} (${item.ratingCount} review${item.ratingCount > 1 ? "s" : ""})` : "No reviews yet"}</span>
          </div>
          <p className="mt-5 font-display text-4xl font-semibold text-primary">{money(item.price)}</p>
          <p className="mt-5 leading-relaxed text-muted-foreground">{item.description}</p>
          <p className="mt-5 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" />{item.location}</p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border bg-card p-4">
            <UserAvatar name={item.vendor?.name} src={item.vendor?.image} className="h-12 w-12" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-semibold"><Store className="h-4 w-4 text-primary" /><span className="truncate">{item.vendor?.businessName || item.vendor?.name}</span></p>
              <p className="text-sm text-muted-foreground">{item.vendor?.reviewCount ? `Restaurant rating ${item.vendor.rating} · ${item.vendor.reviewCount} reviews` : "New restaurant"}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {isCustomer && !ownItem ? (
              <>
                <Button size="lg" onClick={() => setOrderOpen(true)}><ShoppingBag />Order now</Button>
                <Button size="lg" variant="outline" loading={fav.isPending} onClick={() => fav.mutate(!state?.favorite)} aria-pressed={!!state?.favorite}>
                  <Heart className={state?.favorite ? "fill-primary text-primary" : ""} />{state?.favorite ? "Saved" : "Save"}
                </Button>
              </>
            ) : (
              <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                {ownItem ? "This is your own menu item — you can't order it." : role === "vendor" ? "Vendors can't place customer orders. Sign in with a customer account to order." : "Admins can't place customer orders."}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-14 max-w-3xl">
        <h2 className="section-title !text-2xl">Reviews</h2>
        <div className="mt-5">
          {isCustomer && state?.canReview && <ReviewForm key={state.myReview?.rating ?? "new"} itemId={item._id} existing={state.myReview} />}
          {isCustomer && state && !state.canReview && <p className="mb-5 text-sm text-muted-foreground">You can review this item once the restaurant accepts one of your orders.</p>}
          {!item.reviews?.length ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : (
            <ul className="space-y-4">
              {item.reviews.map((r, i) => (
                <li key={i} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-3"><UserAvatar name={r.name} src={r.image} /><div><p className="text-sm font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</p></div><div className="ml-auto"><Stars value={r.rating} /></div></div>
                  {r.comment && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      {isCustomer && !ownItem && <OrderDialog item={item} open={orderOpen} onOpenChange={setOrderOpen} />}
    </div>
  );
}
