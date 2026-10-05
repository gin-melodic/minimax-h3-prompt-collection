"use client";

import { useState } from "react";

export function CopyPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="button secondary" onClick={async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }}>{copied ? "已复制" : "复制提示词"}</button>;
}
