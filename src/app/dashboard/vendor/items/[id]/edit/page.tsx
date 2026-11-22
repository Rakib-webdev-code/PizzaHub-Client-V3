"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { ItemForm } from "@/components/dashboard/item-form";
import { ErrorState, PageHeader, PageLoader } from "@/components/shared/common";

export default function EditItem() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["vendor-item", id], queryFn: () => api<{ item: MenuItem }>(`/api/vendor/items/${id}`), retry: false });
  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState error={error} retry={refetch} title="Item not found" />;
  return (<><PageHeader title="Edit Menu Item" /><ItemForm item={data.item} /></>);
}
