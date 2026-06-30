"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 w-full px-4 py-2.5 bg-omran/10 hover:bg-omran/15 text-omran rounded-xl text-sm font-medium transition-colors border border-omran/20"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 flex-shrink-0 text-green-600" />
          <span className="text-green-600">تم نسخ الرابط!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{url}</span>
        </>
      )}
    </button>
  );
}
