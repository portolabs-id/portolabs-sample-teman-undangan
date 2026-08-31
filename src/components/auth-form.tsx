"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { signIn, signUp } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { REGISTER_TURNSTILE_ACTION } from "@/lib/turnstile/actions";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

export function AuthForm({ mode, turnstileSiteKey }: { mode: "login" | "register"; turnstileSiteKey?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const showTurnstile = mode === "register" && Boolean(turnstileSiteKey);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const name = String(fd.get("name") ?? "");
    const turnstileToken = String(fd.get("cf-turnstile-response") ?? "");
    setLoading(true);
    try {
      const res = mode === "register"
        ? await signUp.email({ email, password, name }, { headers: { "x-turnstile-token": turnstileToken } })
        : await signIn.email({ email, password });
      if (res.error) {
        toast.error(res.error.message ?? (mode === "register" ? "Gagal daftar" : "Gagal masuk"));
        // Turnstile tokens are single use: reset so the visitor can retry.
        window.turnstile?.reset();
        return;
      }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {mode === "register" && (
        <div className="grid gap-2">
          <Label htmlFor="name">Nama</Label>
          <Input id="name" name="name" required />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Kata sandi</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      {showTurnstile && (
        <>
          <Script src={TURNSTILE_SCRIPT} strategy="afterInteractive" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey!} data-action={REGISTER_TURNSTILE_ACTION} />
        </>
      )}
      <Button type="submit" disabled={loading}>
        {mode === "register" ? "Daftar" : "Masuk"}
      </Button>
    </form>
  );
}
