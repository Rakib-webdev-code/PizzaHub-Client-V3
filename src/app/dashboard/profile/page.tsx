"use client";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { errMsg, uploadImage } from "@/lib/api";
import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/common";

export default function ProfilePage() {
  const { me } = useMe();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(me?.name ?? "");
  const [businessName, setBusinessName] = useState(me?.businessName ?? "");
  const [image, setImage] = useState<string | null>(me?.image ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!me) return null;

  const pick = async (f?: File) => {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return toast.error("Choose a JPG, PNG, WEBP or GIF image");
    if (f.size > 4 * 1024 * 1024) return toast.error("Image must be under 4MB");
    setUploading(true);
    try { setImage(await uploadImage(f)); toast.success("Image uploaded — save to apply"); } catch (e) { toast.error(errMsg(e)); }
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Name must be at least 2 characters");
    setSaving(true);
    // role / subscription fields are rejected by the auth server - only these fields can be edited
    const { error } = await authClient.updateUser({ name: name.trim(), ...(image ? { image } : {}), ...(me.role === "vendor" ? { businessName: businessName.trim() } : {}) });
    setSaving(false);
    if (error) return toast.error(error.message || "Couldn't update your profile");
    await qc.invalidateQueries({ queryKey: ["me"] });
    toast.success("Profile updated");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile Settings" description="Update how you appear on PizzaHub." />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={save} className="grid gap-5" noValidate>
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar name={name} src={image} className="h-20 w-20 text-lg" />
                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Change profile image" className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Camera className="h-4 w-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
              </div>
              <div><p className="font-semibold">{me.name}</p><Badge variant="secondary" className="mt-1 capitalize">{me.role}</Badge>{uploading && <span className="ml-2 text-xs text-muted-foreground">Uploading…</span>}</div>
            </div>
            <div className="grid gap-1.5"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            {me.role === "vendor" && <div className="grid gap-1.5"><Label htmlFor="biz">Restaurant name</Label><Input id="biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></div>}
            <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" value={me.email} disabled /><p className="text-xs text-muted-foreground">Email and role can&apos;t be changed here.</p></div>
            <Button type="submit" className="w-fit" loading={saving} disabled={uploading}>Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
