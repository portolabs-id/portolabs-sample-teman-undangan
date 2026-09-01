import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";

export default function LoginPage() {
  return (
    <div className="auth__card">
      <div>
        <Brand />
        <h1 className="auth__title">Masuk</h1>
        <p className="auth__subtitle">Lanjutkan mengelola undangan dan daftar tamu Anda.</p>
      </div>
      <AuthForm mode="login" />
      <p className="auth__hint">
        Belum punya akun? <Link href="/register">Daftar</Link>
      </p>
    </div>
  );
}
