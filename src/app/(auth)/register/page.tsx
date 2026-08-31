import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { getTurnstileSiteKey } from "@/lib/turnstile/verify";

// The Turnstile site key is read from the Worker env at request time, so this
// page must not be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const turnstileSiteKey = await getTurnstileSiteKey();
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Daftar</h1>
      <AuthForm mode="register" turnstileSiteKey={turnstileSiteKey} />
      <p className="text-sm">Sudah punya akun? <Link className="underline" href="/login">Masuk</Link></p>
    </main>
  );
}
