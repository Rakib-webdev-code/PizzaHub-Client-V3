"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutDashboard, LogOut, UserCog } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { clearTokenCache } from "@/lib/api";
import type { Me } from "@/lib/types";

export function useSignOut() {
  const router = useRouter();
  const qc = useQueryClient();
  return async () => {
    await authClient.signOut();
    clearTokenCache();
    qc.clear();
    toast.success("Signed out. See you soon!");
    router.push("/");
  };
}

export function UserMenu({ me, name, image }: { me?: Me; name: string; image?: string | null }) {
  const signOut = useSignOut();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border bg-card p-1 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open profile menu">
        <UserAvatar name={name} src={me?.image ?? image} />
        <span className="hidden max-w-[110px] truncate text-sm font-medium sm:block">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-semibold">{name}</p>
          {me && <p className="text-xs capitalize text-muted-foreground">{me.role} account</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard />Dashboard</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/profile"><UserCog />Profile Settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} className="text-destructive focus:text-destructive"><LogOut />Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
