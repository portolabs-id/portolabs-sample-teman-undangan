import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { getTurnstileSiteKey } from "@/lib/turnstile/verify";

// The Turnstile site key is read from the Worker env at request time, so this
// page must not be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const turnstileSiteKey = await getTurnstileSiteKey();
  return (
    <div className="auth__card">
      <div>
        <Brand />
        <h1 className="auth__title">Daftar</h1>
        <p className="auth__subtitle">Buat akun, lalu susun undangan pertama Anda malam ini.</p>
      </div>
      <AuthForm mode="register" turnstileSiteKey={turnstileSiteKey} />
      <p className="auth__hint">
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </div>
  );
}
