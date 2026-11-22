"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarCheck, ChefHat, Search, ShoppingBag, Star, Store, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/common";
import { MenuCard, MenuCardSkeleton } from "@/components/shared/menu-card";

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

function Heading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-10">
      <h2 className="section-title">{title}</h2>
      {text && <p className="section-lead">{text}</p>}
    </div>
  );
}

export function FeaturedItems() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["featured"],
    queryFn: () => api<{ items: MenuItem[] }>("/api/menu/featured", { auth: false }),
  });
  const items = (data?.items ?? []).slice(0, 8);
  return (
    <section className="container pt-20">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading title="Featured Menu Items" text="Fresh from the oven — Premium restaurants are featured first." />
          <Button asChild variant="outline" className="mb-10"><Link href="/menu">See full menu</Link></Button>
        </div>
      </Reveal>
      {error ? <ErrorState error={error} retry={refetch} title="Couldn't load featured items" /> : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <MenuCardSkeleton key={i} />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No pizzas yet" text="Approved menu items will appear here as soon as restaurants publish them." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => <Reveal key={it._id} delay={(i % 4) * 0.06} className="h-full"><MenuCard item={it} /></Reveal>)}
        </div>
      )}
    </section>
  );
}

export function CategoriesSection() {
  const { data } = useQuery({ queryKey: ["categories"], queryFn: () => api<{ categories: { name: string; count: number }[] }>("/api/menu/categories", { auth: false }) });
  const counts = Object.fromEntries((data?.categories ?? []).map((c) => [c.name, c.count]));
  return (
    <section className="container pt-24">
      <Reveal><Heading title="Pizza Categories" text="Start with what you're craving." /></Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.name} delay={(i % 3) * 0.06} className="h-full">
            <Link href={`/menu?category=${encodeURIComponent(c.name)}`} className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-5 transition hover:border-primary/50 hover:shadow-lg">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-3xl transition-transform group-hover:scale-110">{c.emoji}</span>
              <span className="min-w-0">
                <span className="block font-display text-lg font-semibold">{c.name}</span>
                <span className="block text-sm text-muted-foreground">{c.blurb}</span>
                {data && <span className="mt-1 block text-xs font-semibold text-primary">{counts[c.name] ?? 0} items</span>}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const WHY = [
  { icon: Store, title: "Local pizzerias, one place", text: "Menus from neighbourhood restaurants — compare prices, areas and ratings without juggling apps." },
  { icon: BadgeCheck, title: "Every item reviewed", text: "Admins approve each menu item before it goes live, so listings stay accurate and trustworthy." },
  { icon: CalendarCheck, title: "Order for the day you want", text: "Choose a delivery date, add your address and notes, and track the order from request to confirmation." },
  { icon: Star, title: "Real reviews", text: "Only customers whose order was accepted can rate an item — ratings you can rely on." },
];
export function WhyChoose() {
  return (
    <section className="container pt-24">
      <Reveal><Heading title="Why Choose PizzaHub?" text="Built for hungry customers and for the restaurants that feed them." /></Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {WHY.map((w, i) => (
          <Reveal key={w.title} delay={i * 0.07} className="h-full">
            <div className="h-full rounded-2xl border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><w.icon className="h-6 w-6" /></div>
              <h3 className="font-display text-lg font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Search, title: "Find your pizza", text: "Search by name, filter by category or area and sort by price." },
  { icon: ShoppingBag, title: "Place your order", text: "Pick a delivery date, add your address and any special instructions." },
  { icon: ChefHat, title: "The restaurant confirms", text: "The pizzeria accepts your order and you get an email when it does." },
  { icon: Truck, title: "Enjoy it hot", text: "Track the status in your dashboard until it arrives at your door." },
];
export function HowItWorks() {
  return (
    <section className="container pt-24">
      <Reveal><Heading title="How PizzaHub Works" text="From craving to doorstep in four steps." /></Reveal>
      <ol className="grid gap-5 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08} className="h-full">
            <li className="relative h-full rounded-2xl border bg-secondary/50 p-6">
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">Step {i + 1}</span>
              <s.icon className="mb-4 mt-2 h-8 w-8 text-primary" />
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function VendorCta() {
  return (
    <section className="container pt-24">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:p-12">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Run a pizzeria? Put your menu in front of hungry customers.</h2>
            <p className="mt-3 text-primary-foreground/85">Start free with 3 menu items. Go Premium for unlimited items, a Premium badge and featured placement on the homepage.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="shrink-0"><Link href="/signup">Become a vendor</Link></Button>
        </div>
      </Reveal>
    </section>
  );
}
