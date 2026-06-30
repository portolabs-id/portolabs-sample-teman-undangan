import { requireUser } from "@/lib/auth/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser(); // redirects to /login if no session
  return <div className="mx-auto max-w-5xl p-6">{children}</div>;
}
