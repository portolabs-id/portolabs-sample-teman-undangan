import Link from "next/link";
import { Brand } from "@/components/brand";
import { requireUser } from "@/lib/auth/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser(); // redirects to /login if no session
  return (
    <div className="landing app">
      <header className="landing__bar">
        <Brand href="/dashboard" />
        <nav className="landing__nav">
          <Link href="/" className="btn btn--soft">Beranda</Link>
        </nav>
      </header>
      <main className="app__body">{children}</main>
    </div>
  );
}
