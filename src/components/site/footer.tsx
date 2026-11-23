import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Logo, XIcon } from "./logo";

const social = [
  { href: "https://x.com", label: "X", icon: <XIcon className="h-4 w-4" /> },
  { href: "https://facebook.com", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { href: "https://instagram.com", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { href: "https://www.linkedin.com/in/md-rakib-dv", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-secondary/50">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Order hot, fresh pizza from the best local pizzerias — and give restaurants one place to run their menu and orders.</p>
          <div className="mt-5 flex gap-2">
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-full border bg-background transition hover:bg-primary hover:text-primary-foreground">{s.icon}</a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/">Home</Link></li>
            <li><Link className="hover:text-foreground" href="/menu">Browse Menu</Link></li>
            <li><Link className="hover:text-foreground" href="/signin">Sign In</Link></li>
            <li><Link className="hover:text-foreground" href="/signup">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Categories</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["Classic Pizzas", "Vegetarian Pizzas", "Meat Lovers", "Sides & Appetizers"].map((c) => (
              <li key={c}><Link className="hover:text-foreground" href={`/menu?category=${encodeURIComponent(c)}`}>{c}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />House 12, Road 5, Dhanmondi, Dhaka</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />+880 1700 000000</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />support@pizzahub.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} PizzaHub. All rights reserved.</div>
    </footer>
  );
}
