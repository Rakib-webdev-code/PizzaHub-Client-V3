import Link from "next/link";
import { Pizza } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="PizzaHub home">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30"><Pizza className="h-5 w-5" /></span>
      <span className="font-display text-2xl font-semibold tracking-tight">PizzaHub</span>
    </Link>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
