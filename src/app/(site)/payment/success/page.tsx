"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, PageLoader } from "@/components/shared/common";

type SessionInfo = { status: string; amount: number; currency: string; plan: string; premiumActive: boolean };

function Success() {
  const sessionId = useSearchParams().get("session_id");
  const qc = useQueryClient();
  // The redirect alone never activates Premium - we wait for the verified Stripe webhook to mark the payment as paid.
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["pay-session", sessionId],
    queryFn: async () => { const r = await api<SessionInfo>(`/api/subscription/session/${sessionId}`); if (r.status === "paid") { qc.invalidateQueries({ queryKey: ["me"] }); qc.invalidateQueries({ queryKey: ["subscription"] }); } return r; },
    enabled: !!sessionId,
    refetchInterval: (q) => (q.state.data?.status === "pending" && q.state.dataUpdateCount < 20 ? 2000 : false),
    retry: false,
  });

  if (!sessionId) return <ErrorState title="Missing payment session" error={new Error("Open this page from the Stripe checkout redirect.")} />;
  if (isLoading) return <PageLoader label="Confirming your payment…" />;
  if (error) return <ErrorState error={error} retry={refetch} title="Couldn't verify the payment" />;
  const paid = data?.status === "paid";
  const failed = data && ["failed", "expired"].includes(data.status);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          {paid ? <CheckCircle2 className="mx-auto h-16 w-16 text-basil" /> : failed ? <XCircle className="mx-auto h-16 w-16 text-destructive" /> : <Clock className="mx-auto h-16 w-16 animate-pulse text-accent" />}
          <h1 className="mt-4 font-display text-3xl font-semibold">{paid ? "You're Premium!" : failed ? "Payment not completed" : "Waiting for confirmation"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {paid ? `Payment of ${money(data!.amount)} confirmed. Unlimited menu items, your Premium badge and featured placement are now active.`
              : failed ? "We couldn't confirm this payment. You haven't been charged for Premium."
              : "Stripe is confirming your payment. This usually takes a few seconds — this page updates automatically."}
          </p>
          <div className="mt-6 grid gap-2">
            <Button asChild><Link href="/dashboard/vendor/subscription">{paid ? "View my subscription" : "Back to subscription"}</Link></Button>
            {paid && <Button asChild variant="outline"><Link href="/dashboard/vendor/items/new">Add a menu item</Link></Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default function PaymentSuccessPage() { return <Suspense fallback={<PageLoader />}><Success /></Suspense>; }
