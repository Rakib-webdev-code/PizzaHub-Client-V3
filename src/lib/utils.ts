import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
export const money = (n?: number | null) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
export const fmtDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
export const fmtDateTime = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export const CATEGORIES = [
  { name: "Classic Pizzas", emoji: "🍕", blurb: "Margherita, pepperoni and other all-time favourites" },
  { name: "Vegetarian Pizzas", emoji: "🥦", blurb: "Garden-fresh toppings, zero meat" },
  { name: "Meat Lovers", emoji: "🥩", blurb: "Loaded with sausage, bacon and chicken" },
  { name: "Specialty / Gourmet Pizzas", emoji: "✨", blurb: "Chef-crafted pies with bold flavours" },
  { name: "Sides & Appetizers", emoji: "🍟", blurb: "Garlic bread, wings and more" },
  { name: "Beverages & Desserts", emoji: "🥤", blurb: "Cold drinks and sweet finishes" },
] as const;
