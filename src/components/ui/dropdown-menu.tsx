"use client";
import * as React from "react";
import * as M from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof M.Content>, React.ComponentPropsWithoutRef<typeof M.Content>>(
  ({ className, sideOffset = 8, ...p }, ref) => (
    <M.Portal>
      <M.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[13rem] overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className)} {...p} />
    </M.Portal>
  ),
);
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof M.Item>, React.ComponentPropsWithoutRef<typeof M.Item>>(({ className, ...p }, ref) => (
  <M.Item ref={ref} className={cn("flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors focus:bg-accent/20 data-[disabled]:opacity-50 [&_svg]:size-4", className)} {...p} />
));
DropdownMenuItem.displayName = "DropdownMenuItem";
export const DropdownMenuLabel = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("px-2.5 py-2 text-sm", className)} {...p} />;
export const DropdownMenuSeparator = () => <M.Separator className="-mx-1 my-1 h-px bg-border" />;
