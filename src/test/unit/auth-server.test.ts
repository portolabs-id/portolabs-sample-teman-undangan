import { afterEach, describe, expect, it, vi } from "vitest";
import { captureRedirect, setRequestHeaders } from "../support/next";

const getSessionMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  initAuth: async () => ({ api: { getSession: getSessionMock } }),
}));

afterEach(() => {
  getSessionMock.mockReset();
});

describe("getSession", () => {
  it("returns the session from better-auth using the current request headers", async () => {
    setRequestHeaders({ cookie: "session=abc" });
    const session = { user: { id: "u1", email: "u1@example.com" } };
    getSessionMock.mockResolvedValue(session);
    const { getSession } = await import("@/lib/auth/server");

    const result = await getSession();

    expect(result).toBe(session);
    expect(getSessionMock).toHaveBeenCalledWith({ headers: expect.any(Headers) });
  });
});

describe("requireUser", () => {
  it("returns the user when a session exists", async () => {
    const session = { user: { id: "u1", email: "u1@example.com" } };
    getSessionMock.mockResolvedValue(session);
    const { requireUser } = await import("@/lib/auth/server");

    const user = await requireUser();

    expect(user).toBe(session.user);
  });

  it("redirects to /login when there is no session", async () => {
    getSessionMock.mockResolvedValue(null);
    const { requireUser } = await import("@/lib/auth/server");

    const url = await captureRedirect(() => requireUser());

    expect(url).toBe("/login");
  });
});
