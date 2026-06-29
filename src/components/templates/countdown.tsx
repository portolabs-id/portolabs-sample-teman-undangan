"use client";
import { useEffect, useState } from "react";
import { countdownParts } from "@/lib/dates";

export function Countdown({ targetMs }: { targetMs: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const c = countdownParts(targetMs, now);
  const cell = (n: number, l: string) => (
    <div className="flex flex-col items-center rounded-lg bg-black/5 px-3 py-2">
      <span className="text-2xl font-bold tabular-nums">{String(n).padStart(2, "0")}</span>
      <span className="text-xs uppercase tracking-wide">{l}</span>
    </div>
  );
  return (
    <div className="flex gap-3">
      {cell(c.days, "Hari")}{cell(c.hours, "Jam")}{cell(c.minutes, "Menit")}{cell(c.seconds, "Detik")}
    </div>
  );
}
