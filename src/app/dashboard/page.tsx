"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-me";
import { PageLoader } from "@/components/shared/common";

export default function DashboardIndex() {
  const router = useRouter();
  const { me } = useMe();
  useEffect(() => { if (me) router.replace(`/dashboard/${me.role}`); }, [me, router]);
  return <PageLoader label="Opening your dashboard…" />;
}
