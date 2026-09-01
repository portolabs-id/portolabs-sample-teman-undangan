"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ArrowRight } from "lucide-react";
import { signIn, signUp } from "@/lib/auth/client";
import { REGISTER_TURNSTILE_ACTION } from "@/lib/turnstile/actions";
import { toast } from "sonner";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

export function AuthForm({ mode, turnstileSiteKey }: { mode: "login" | "register"; turnstileSiteKey?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";
  const showTurnstile = isRegister && Boolean(turnstileSiteKey);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const name = String(fd.get("name") ?? "");
    const turnstileToken = String(fd.get("cf-turnstile-response") ?? "");
    setLoading(true);
    try {
      const res = isRegister
        ? await signUp.email({ email, password, name }, { headers: { "x-turnstile-token": turnstileToken } })
        : await signIn.email({ email, password });
      if (res.error) {
        toast.error(res.error.message ?? (isRegister ? "Gagal daftar" : "Gagal masuk"));
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
    <form onSubmit={onSubmit} className="auth__form">
      {isRegister && (
        <div className="field">
          <label htmlFor="name">Nama</label>
          <input id="name" name="name" placeholder="Nama lengkap Anda" autoComplete="name" required />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="nama@email.com" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Kata sandi</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </div>
      {showTurnstile && (
        <>
          <Script src={TURNSTILE_SCRIPT} strategy="afterInteractive" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey!} data-action={REGISTER_TURNSTILE_ACTION} />
        </>
      )}
      <button type="submit" className="btn btn--solid btn--lg btn--block" disabled={loading}>
        {loading ? "Memproses…" : isRegister ? "Daftar" : "Masuk"}
        <ArrowRight className="btn__icon" size={17} strokeWidth={2.4} />
      </button>
    </form>
  );
}
