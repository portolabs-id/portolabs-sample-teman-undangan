import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Masuk</h1>
      <AuthForm mode="login" />
      <p className="text-sm">Belum punya akun? <Link className="underline" href="/register">Daftar</Link></p>
    </main>
  );
}
