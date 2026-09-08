import { describe, it, expect, vi } from "vitest";

const handler = vi.fn(async (req: Request) => new Response(`echo:${req.url}`, { status: 200 }));

vi.mock("@/lib/auth", () => ({
  initAuth: vi.fn(async () => ({ handler })),
}));

import { GET, POST } from "@/app/api/auth/[...all]/route";

describe("auth catch-all route", () => {
  it("uses the same handler function for GET and POST", () => {
    expect(GET).toBe(POST);
  });

  it("delegates GET requests to the better-auth handler", async () => {
    const req = new Request("http://localhost/api/auth/session");
    const res = await GET(req);

    expect(handler).toHaveBeenCalledWith(req);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("echo:http://localhost/api/auth/session");
  });

  it("delegates POST requests to the better-auth handler", async () => {
    const req = new Request("http://localhost/api/auth/sign-in/email", { method: "POST" });
    const res = await POST(req);

    expect(handler).toHaveBeenCalledWith(req);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("echo:http://localhost/api/auth/sign-in/email");
  });
});
