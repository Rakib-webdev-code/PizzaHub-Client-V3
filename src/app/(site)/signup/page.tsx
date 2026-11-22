"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Eye, EyeOff, ImagePlus, Store, UtensilsCrossed, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearTokenCache, uploadImage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/shared/google-button";

const rules = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
];

export default function SignUpPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" as "customer" | "vendor", businessName: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const pick = (f?: File) => {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return toast.error("Choose a JPG, PNG, WEBP or GIF image");
    if (f.size > 4 * 1024 * 1024) return toast.error("Image must be under 4MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Enter your full name");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Enter a valid email address");
    if (!rules.every((r) => r.test(form.password))) return toast.error("Password doesn't meet the requirements");
    if (form.role === "vendor" && form.businessName.trim().length < 2) return toast.error("Enter your restaurant name");
    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: form.name.trim(), email: form.email, password: form.password, role: form.role,
      ...(form.role === "vendor" ? { businessName: form.businessName.trim() } : {}),
    });
    if (error) { setLoading(false); return toast.error(error.message || "Couldn't create your account"); }
    clearTokenCache();
    qc.clear();
    if (file) {
      try {
        const url = await uploadImage(file);
        await authClient.updateUser({ image: url });
      } catch { toast.warning("Account created, but the profile image couldn't be uploaded. Add it in Profile Settings."); }
    }
    setLoading(false);
    toast.success("Account created. Welcome to PizzaHub!");
    router.replace("/dashboard");
  };

  const roles = [
    { value: "customer", title: "Customer", text: "Order pizza", icon: UtensilsCrossed },
    { value: "vendor", title: "Vendor", text: "Restaurant owner", icon: Store },
  ] as const;

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardContent className="p-7">
          <h1 className="font-display text-3xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join as a customer or open a restaurant account.</p>

          <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account role">
              {roles.map((r) => (
                <button key={r.value} type="button" role="radio" aria-checked={form.role === r.value} onClick={() => setForm({ ...form, role: r.value })}
                  className={cn("flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition", form.role === r.value ? "border-primary bg-primary/5" : "hover:border-primary/40")}>
                  <r.icon className="h-6 w-6 text-primary" /><span><span className="block text-sm font-semibold">{r.title}</span><span className="block text-xs text-muted-foreground">{r.text}</span></span>
                </button>
              ))}
            </div>
            <div className="grid gap-1.5"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            {form.role === "vendor" && <div className="grid gap-1.5"><Label htmlFor="biz">Restaurant name</Label><Input id="biz" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>}
            <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} autoComplete="new-password" className="pr-11" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
              <ul className="mt-1 grid gap-1 text-xs">
                {rules.map((r) => { const ok = r.test(form.password); return <li key={r.label} className={cn("flex items-center gap-1.5", ok ? "text-basil" : "text-muted-foreground")}>{ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{r.label}</li>; })}
              </ul>
            </div>
            <div className="grid gap-1.5">
              <Label>Profile image <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-dashed text-muted-foreground hover:border-primary" aria-label="Choose profile image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
                {file ? <Button type="button" variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>Remove</Button> : <span className="text-xs text-muted-foreground">You can skip this and add one later.</span>}
              </div>
            </div>
            <Button type="submit" size="lg" loading={loading}>Create account</Button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <GoogleButton label="Sign up with Google" />
          <p className="mt-2 text-center text-xs text-muted-foreground">Google accounts are created as customers.</p>
          <p className="mt-5 text-center text-sm text-muted-foreground">Already have an account? <Link href="/signin" className="font-semibold text-primary hover:underline">Sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
