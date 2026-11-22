"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearTokenCache } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/shared/google-button";

const safeRedirect = (p?: string | null) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/dashboard");

function SignInForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const redirect = safeRedirect(useSearchParams().get("redirect"));
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Enter a valid email address");
    if (!form.password) return toast.error("Enter your password");
    setLoading(true);
    const { error } = await authClient.signIn.email({ email: form.email, password: form.password });
    setLoading(false);
    if (error) return toast.error(error.message || "Invalid email or password");
    clearTokenCache();
    qc.clear();
    toast.success("Welcome back!");
    router.replace(redirect);
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-7">
          <h1 className="font-display text-3xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back — your pizza is waiting.</p>
          <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
            <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="pr-11" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>
            <Button type="submit" size="lg" loading={loading}>Sign in</Button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <GoogleButton callbackURL={redirect} />
          <p className="mt-6 text-center text-sm text-muted-foreground">New to PizzaHub? <Link href="/signup" className="font-semibold text-primary hover:underline">Create an account</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return <Suspense fallback={null}><SignInForm /></Suspense>;
}
