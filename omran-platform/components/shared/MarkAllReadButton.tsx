"use client";

import { CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MarkAllReadButton({ userId }: { userId: string }) {
  const router = useRouter();
  const handle = async () => {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    router.refresh();
  };
  return (
    <button onClick={handle} className="flex items-center gap-1.5 text-sm text-omran font-medium hover:underline">
      <CheckCheck className="w-4 h-4" />
      تعليم الكل كمقروء
    </button>
  );
}
