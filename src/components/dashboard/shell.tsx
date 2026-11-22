"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, ListOrdered, Menu, PlusCircle, Receipt, ShieldCheck, ShoppingBag, Sparkles, UserCog, Users, UtensilsCrossed, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { UserMenu } from "@/components/site/user-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Me, Role } from "@/lib/types";

const NAV: Record<Role, { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/items", label: "My Menu Items", icon: UtensilsCrossed },
    { href: "/dashboard/vendor/items/new", label: "Add Menu Item", icon: PlusCircle },
    { href: "/dashboard/vendor/orders", label: "Customer Orders", icon: ListOrdered },
    { href: "/dashboard/vendor/subscription", label: "Subscription", icon: Sparkles },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCog },
  ],
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/dashboard/customer/favorites", label: "Favorites", icon: Heart },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/items", label: "Manage Menu Items", icon: ShieldCheck },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/profile", label: "Profile Settings", icon: UserCog },
  ],
};

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const exact = new Set([`/dashboard/${role}`]);
  const isActive = (href: string) => (exact.has(href) ? pathname === href : pathname === href || (pathname.startsWith(href + "/") && !NAV[role].some((n) => n.href !== href && n.href.startsWith(href + "/") && pathname.startsWith(n.href))));
  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {NAV[role].map((n) => (
        <Link key={n.href} href={n.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-accent/15", isActive(n.href) && "bg-primary text-primary-foreground hover:bg-primary")}>
          <n.icon className="h-4 w-4" />{n.label}
        </Link>
      ))}
    </nav>
  );
}

export function DashboardShell({ me, children }: { me: Me; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background p-4 lg:flex">
        <Logo className="px-2 py-1" />
        <Badge variant="secondary" className="mx-2 mt-4 w-fit capitalize">{me.role} dashboard</Badge>
        <div className="mt-5 flex-1 overflow-y-auto"><SidebarNav role={me.role} /></div>
        <Link href="/" className="rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground hover:bg-accent/15">← Back to website</Link>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-background p-4 shadow-2xl">
            <div className="flex items-center justify-between"><Logo className="px-2" /><Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}><X /></Button></div>
            <div className="mt-6 flex-1 overflow-y-auto"><SidebarNav role={me.role} onNavigate={() => setOpen(false)} /></div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-lg sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></Button>
          <p className="hidden text-sm text-muted-foreground sm:block lg:block">Signed in as <span className="font-semibold text-foreground">{me.name}</span></p>
          <div className="ml-auto flex items-center gap-2"><ThemeToggle /><UserMenu me={me} name={me.name} /></div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
