"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { useMe } from "@/hooks/use-me";
import { DashboardShell } from "@/components/dashboard/shell";
import { ErrorState, PageLoader } from "@/components/shared/common";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/components/site/user-menu";

const SECTIONS = ["vendor", "customer", "admin"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useSignOut();
  const { me, isAuthed, loading, error, refetch } = useMe();
  const section = pathname.split("/")[2];
  const wrongRole = !!me && SECTIONS.includes(section) && section !== me.role;

  useEffect(() => {
    if (loading) return;
    // Only redirect once the session has settled - reloading a private route keeps you signed in.
    if (!isAuthed) router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
    else if (wrongRole && me) { toast.error("You don't have access to that dashboard"); router.replace(`/dashboard/${me.role}`); }
  }, [loading, isAuthed, wrongRole, me, pathname, router]);

  if (loading || !isAuthed) return <PageLoader label="Loading your dashboard…" />;
  if (error && !me) return <div className="container py-16"><ErrorState error={error} retry={refetch} title="Couldn't load your account" /></div>;
  if (!me || wrongRole) return <PageLoader label="Redirecting…" />;
  if (me.isBlocked)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="h-14 w-14 text-destructive" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Account blocked</h1>
        <p className="mt-2 max-w-md text-muted-foreground">An administrator has blocked this account, so dashboard features are unavailable. Contact support@pizzahub.com if you think this is a mistake.</p>
        <Button className="mt-6" variant="outline" onClick={signOut}>Sign out</Button>
      </div>
    );
  return <DashboardShell me={me}>{children}</DashboardShell>;
}
