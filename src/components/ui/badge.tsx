import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground",
      success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      warning: "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
      danger: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
      muted: "border-transparent bg-muted text-muted-foreground",
      premium: "border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950",
    },
  },
  defaultVariants: { variant: "default" },
});
export function Badge({ className, variant, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...p} />;
}
