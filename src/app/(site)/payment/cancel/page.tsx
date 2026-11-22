import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <XCircle className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-display text-3xl font-semibold">Payment cancelled</h1>
          <p className="mt-2 text-sm text-muted-foreground">No charge was made and your plan hasn&apos;t changed. You can upgrade whenever you&apos;re ready.</p>
          <div className="mt-6 grid gap-2">
            <Button asChild><Link href="/dashboard/vendor/subscription">Back to subscription</Link></Button>
            <Button asChild variant="outline"><Link href="/menu">Browse menu</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
