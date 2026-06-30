import { initAuth } from "@/lib/auth";

async function handler(req: Request) {
  const auth = await initAuth();
  return auth.handler(req);
}

export { handler as GET, handler as POST };
