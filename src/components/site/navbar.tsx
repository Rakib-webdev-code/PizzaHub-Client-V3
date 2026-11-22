"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { useMe } from "@/hooks/use-me";
import { cn } from "@/lib/utils";

const ROLE_LINKS = {
  customer: [{ href: "/dashboard/customer/orders", label: "My Orders" }, { href: "/dashboard/customer/favorites", label: "Favorites" }],
  vendor: [{ href: "/dashboard/vendor/items", label: "My Menu" }, { href: "/dashboard/vendor/orders", label: "Orders" }],
  admin: [{ href: "/dashboard/admin/users", label: "Manage Users" }, { href: "/dashboard/admin/items", label: "Menu Review" }],
} as const;

export function Navbar() {
  const pathname = usePathname();
  const { session, me, role, isAuthed, loading } = useMe();
  const [open, setOpen] = useState(false);
  const links = [{ href: "/", label: "Home" }, { href: "/menu", label: "Browse Menu" }, ...(role ? ROLE_LINKS[role] : [])];
  const active = (h: string) => (h === "/" ? pathname === "/" : pathname.startsWith(h));
  const name = me?.name ?? session?.user?.name ?? "Account";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/15", active(l.href) && "bg-primary/10 text-primary")}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading ? <Skeleton className="h-10 w-28 rounded-full" /> : isAuthed ? (
            <UserMenu me={me} name={name} image={session?.user?.image} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost"><Link href="/signin">Sign In</Link></Button>
              <Button asChild><Link href="/signup">Sign Up</Link></Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t md:hidden">
            <div className="container flex flex-col gap-1 py-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={cn("rounded-xl px-4 py-3 text-sm font-medium hover:bg-accent/15", active(l.href) && "bg-primary/10 text-primary")}>{l.label}</Link>
              ))}
              {!loading && !isAuthed && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" onClick={() => setOpen(false)}><Link href="/signin">Sign In</Link></Button>
                  <Button asChild onClick={() => setOpen(false)}><Link href="/signup">Sign Up</Link></Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
