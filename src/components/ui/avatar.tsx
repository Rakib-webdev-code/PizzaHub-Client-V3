"use client";
import * as A from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <A.Root className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full", className)}>
      <A.Image src={src || undefined} alt={name || "User"} className="aspect-square h-full w-full object-cover" />
      <A.Fallback className="flex h-full w-full items-center justify-center bg-primary/15 text-xs font-bold text-primary">{initials}</A.Fallback>
    </A.Root>
  );
}
