import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initAuth } from "@/lib/auth";

export async function getSession() {
  const auth = await initAuth();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}
