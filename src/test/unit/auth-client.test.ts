import { describe, expect, it, vi } from "vitest";

const fakeClient = {
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(),
};

vi.mock("better-auth/react", () => ({
  createAuthClient: () => fakeClient,
}));

describe("auth client", () => {
  it("re-exports the better-auth client's methods and hook", async () => {
    const mod = await import("@/lib/auth/client");

    expect(mod.authClient).toBe(fakeClient);
    expect(mod.signIn).toBe(fakeClient.signIn);
    expect(mod.signUp).toBe(fakeClient.signUp);
    expect(mod.signOut).toBe(fakeClient.signOut);
    expect(mod.useSession).toBe(fakeClient.useSession);
  });
});
