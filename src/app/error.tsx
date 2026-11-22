"use client";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl">🔥</div>
      <h1 className="mt-4 font-display text-3xl font-semibold">The oven got too hot</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{error.message || "An unexpected error occurred."} Reload the page or try again.</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </main>
  );
}
