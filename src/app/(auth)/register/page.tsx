import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Daftar</h1>
      <AuthForm mode="register" />
      <p className="text-sm">Sudah punya akun? <Link className="underline" href="/login">Masuk</Link></p>
    </main>
  );
}
