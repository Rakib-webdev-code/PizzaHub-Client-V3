"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

function PizzaArt() {
  const pepperoni = [[150, 120], [250, 130], [200, 200], [130, 220], [270, 235], [205, 100], [175, 270], [240, 280]];
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-2xl" role="img" aria-label="Illustration of a pizza">
      <circle cx="200" cy="200" r="190" fill="#e0a24a" />
      <circle cx="200" cy="200" r="190" fill="none" stroke="#c98a32" strokeWidth="6" strokeDasharray="2 14" strokeLinecap="round" />
      <circle cx="200" cy="200" r="165" fill="#d2381f" />
      <circle cx="200" cy="200" r="155" fill="#f5cf6e" />
      {[0, 45, 90, 135].map((a) => <line key={a} x1="200" y1="45" x2="200" y2="355" stroke="#d9a93f" strokeWidth="3" transform={`rotate(${a} 200 200)`} />)}
      {pepperoni.map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r="26" fill="#b3261e" /><circle cx={x - 7} cy={y - 6} r="4" fill="#8f1c16" /><circle cx={x + 8} cy={y + 7} r="3.5" fill="#8f1c16" /></g>
      ))}
      {[[110, 170, 20], [290, 180, -30], [160, 320, 70], [225, 60, 10], [305, 270, 120]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="16" ry="8" fill="#3f8f55" transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </svg>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="dough-bg relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20" aria-hidden />
      <div className="container relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Hot &amp; Fresh Pizza Delivered to Your Door</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Discover pizzerias near you, browse their full menus and order in a minute. Every item is reviewed before it goes live, so what you see is what arrives.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/menu">Explore Pizza Menu</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/signup">Open a restaurant account</Link></Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" />Local pizzerias</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Pick your delivery date</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Reviewed menus</li>
          </ul>
        </motion.div>
        <motion.div className="mx-auto aspect-square w-full max-w-md" initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}>
          <motion.div className="h-full w-full" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}>
            <PizzaArt />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
