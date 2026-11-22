import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl">🍕</div>
      <h1 className="mt-4 font-display text-5xl font-semibold">404</h1>
      <p className="mt-2 text-lg font-medium">This slice is missing.</p>
      <p className="mt-1 max-w-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
      <div className="mt-6 flex gap-3">
        <Button asChild><Link href="/">Back to home</Link></Button>
        <Button asChild variant="outline"><Link href="/menu">Browse menu</Link></Button>
      </div>
    </main>
  );
}
