"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ApiError, api, errMsg, uploadImage } from "@/lib/api";
import { CATEGORIES } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Img } from "@/components/shared/common";

export function ItemForm({ item }: { item?: MenuItem }) {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ itemName: item?.itemName ?? "", category: item?.category ?? "", description: item?.description ?? "", price: item ? String(item.price) : "", location: item?.location ?? "" });
  const [images, setImages] = useState<string[]>(item?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 4 - images.length);
    if (files.length > list.length) toast.warning("You can upload up to 4 images");
    setUploading(true);
    for (const file of list) {
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { toast.error(`${file.name}: only JPG, PNG, WEBP or GIF`); continue; }
      if (file.size > 4 * 1024 * 1024) { toast.error(`${file.name} is larger than 4MB`); continue; }
      try { const url = await uploadImage(file); setImages((p) => [...p, url]); } catch (e) { toast.error(`Upload failed for ${file.name}: ${errMsg(e)}`); }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = useMutation({
    mutationFn: () => api(item ? `/api/vendor/items/${item._id}` : "/api/vendor/items", { method: item ? "PUT" : "POST", body: { ...f, price: Number(f.price), images } }),
    onSuccess: (r: any) => {
      toast.success(item ? "Menu item updated" : r?.message || "Menu item submitted for approval");
      qc.invalidateQueries({ queryKey: ["vendor-items"] }); qc.invalidateQueries({ queryKey: ["vendor-overview"] });
      router.push("/dashboard/vendor/items");
    },
    onError: (e) => {
      if (e instanceof ApiError && e.code === "PREMIUM_REQUIRED") toast.error(e.message, { action: { label: "Upgrade", onClick: () => router.push("/dashboard/vendor/subscription") }, duration: 8000 });
      else toast.error(errMsg(e));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.itemName.trim().length < 3) er.itemName = "Enter an item name (3+ characters)";
    if (!f.category) er.category = "Choose a category";
    if (f.description.trim().length < 10) er.description = "Description needs at least 10 characters";
    if (!(Number(f.price) > 0)) er.price = "Enter a price greater than 0";
    if (f.location.trim().length < 2) er.location = "Enter the area / city";
    if (!images.length) er.images = "Upload at least one image";
    setErrors(er);
    if (Object.keys(er).length) return toast.error(Object.values(er)[0]);
    save.mutate();
  };
  const err = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;

  return (
    <Card className="max-w-3xl">
      <CardContent className="p-6">
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="n">Item name</Label><Input id="n" value={f.itemName} onChange={(e) => setF({ ...f, itemName: e.target.value })} />{err("itemName")}</div>
            <div className="grid gap-1.5"><Label htmlFor="c">Category</Label>
              <Select id="c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="">Select category</option>{CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</Select>{err("category")}</div>
            <div className="grid gap-1.5"><Label htmlFor="p">Price (USD)</Label><Input id="p" type="number" min="0" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />{err("price")}</div>
            <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="l">Location (area / city)</Label><Input id="l" placeholder="Gulshan, Dhaka" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />{err("location")}</div>
            <div className="grid gap-1.5 sm:col-span-2"><Label htmlFor="d">Description</Label><Textarea id="d" rows={4} maxLength={1000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />{err("description")}</div>
          </div>
          <div className="grid gap-2">
            <Label>Item images <span className="font-normal text-muted-foreground">(1–4, required)</span></Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((src, i) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border">
                  <Img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((x) => x !== src))} aria-label="Remove image" className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white"><X className="h-3.5 w-3.5" /></button>
                  {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
                </div>
              ))}
              {images.length < 4 && (
                <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-sm text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60">
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}{uploading ? "Uploading…" : "Add image"}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            {err("images")}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" loading={save.isPending} disabled={uploading}>{item ? "Save changes" : "Submit for approval"}</Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
          </div>
          {!item && <p className="text-xs text-muted-foreground">New items start as <b>Pending</b> and appear publicly once an admin approves them.</p>}
        </form>
      </CardContent>
    </Card>
  );
}
