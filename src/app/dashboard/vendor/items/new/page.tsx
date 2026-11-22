"use client";
import { ItemForm } from "@/components/dashboard/item-form";
import { PageHeader } from "@/components/shared/common";

export default function NewItem() {
  return (<><PageHeader title="Add Menu Item" description="Fill in the details and upload photos. An admin reviews every new item." /><ItemForm /></>);
}
