import { describe, it, expect } from "vitest";
import { getTableColumns, createTableRelationsHelpers } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  invitations,
  photos,
  rsvps,
  user,
  session,
  account,
  verification,
  userRelations,
  sessionRelations,
  accountRelations,
} from "@/lib/db/schema";
import type { Invitation, Photo, Rsvp } from "@/lib/db/schema";

describe("db/schema tables", () => {
  it("declares the invitations table with its expected columns", () => {
    const columns = Object.keys(getTableColumns(invitations));
    expect(columns).toEqual(
      expect.arrayContaining([
        "id",
        "userId",
        "slug",
        "template",
        "groomName",
        "groomParents",
        "brideName",
        "brideParents",
        "akadAt",
        "resepsiAt",
        "venueName",
        "venueAddress",
        "mapsUrl",
        "giftBankName",
        "giftAccountNumber",
        "giftAccountHolder",
        "giftQrisKey",
        "coverPhotoKey",
        "status",
        "createdAt",
        "updatedAt",
      ]),
    );
  });

  it("declares the photos table with its expected columns", () => {
    const columns = Object.keys(getTableColumns(photos));
    expect(columns).toEqual(
      expect.arrayContaining(["id", "invitationId", "r2Key", "order", "createdAt"]),
    );
  });

  it("declares the rsvps table with its expected columns", () => {
    const columns = Object.keys(getTableColumns(rsvps));
    expect(columns).toEqual(
      expect.arrayContaining(["id", "invitationId", "guestName", "attendance", "headcount", "message", "createdAt"]),
    );
  });

  it("exposes inferred select types usable as plain object shapes", () => {
    const invitation: Invitation = {
      id: "i1",
      userId: "u1",
      slug: "a-b-123456",
      template: "classic",
      groomName: "Budi",
      groomParents: "",
      brideName: "Siti",
      brideParents: "",
      akadAt: null,
      resepsiAt: null,
      venueName: "",
      venueAddress: "",
      mapsUrl: null,
      giftBankName: null,
      giftAccountNumber: null,
      giftAccountHolder: null,
      giftQrisKey: null,
      coverPhotoKey: null,
      status: "draft",
      createdAt: 0,
      updatedAt: 0,
    };
    const photo: Photo = { id: "p1", invitationId: "i1", r2Key: "k", order: 0, createdAt: 0 };
    const rsvp: Rsvp = { id: "r1", invitationId: "i1", guestName: "Andi", attendance: "yes", headcount: 1, message: null, createdAt: 0 };

    expect(invitation.status).toBe("draft");
    expect(photo.r2Key).toBe("k");
    expect(rsvp.attendance).toBe("yes");
  });
});

describe("db/auth.schema tables", () => {
  it("declares the user table with its expected columns", () => {
    const columns = Object.keys(getTableColumns(user));
    expect(columns).toEqual(
      expect.arrayContaining(["id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt"]),
    );
  });

  it("declares the session table with its expected columns", () => {
    const columns = Object.keys(getTableColumns(session));
    expect(columns).toEqual(
      expect.arrayContaining([
        "id",
        "expiresAt",
        "token",
        "createdAt",
        "updatedAt",
        "ipAddress",
        "userAgent",
        "userId",
      ]),
    );
  });

  it("declares the account table with its expected columns", () => {
    const columns = Object.keys(getTableColumns(account));
    expect(columns).toEqual(
      expect.arrayContaining([
        "id",
        "accountId",
        "providerId",
        "userId",
        "accessToken",
        "refreshToken",
        "idToken",
        "accessTokenExpiresAt",
        "refreshTokenExpiresAt",
        "scope",
        "password",
        "createdAt",
        "updatedAt",
      ]),
    );
  });

  it("declares the verification table with its expected columns", () => {
    const columns = Object.keys(getTableColumns(verification));
    expect(columns).toEqual(
      expect.arrayContaining(["id", "identifier", "value", "expiresAt", "createdAt", "updatedAt"]),
    );
  });

  it("builds the user relations config linking sessions and accounts", () => {
    const built = userRelations.config(createTableRelationsHelpers(user));
    expect(Object.keys(built)).toEqual(expect.arrayContaining(["sessions", "accounts"]));
  });

  it("builds the session relations config linking back to user", () => {
    const built = sessionRelations.config(createTableRelationsHelpers(session));
    expect(Object.keys(built)).toEqual(expect.arrayContaining(["user"]));
  });

  it("builds the account relations config linking back to user", () => {
    const built = accountRelations.config(createTableRelationsHelpers(account));
    expect(Object.keys(built)).toEqual(expect.arrayContaining(["user"]));
  });

  it("runs the $onUpdate callbacks that stamp updatedAt with a fresh Date", () => {
    expect(getTableColumns(user).updatedAt.onUpdateFn?.()).toBeInstanceOf(Date);
    expect(getTableColumns(session).updatedAt.onUpdateFn?.()).toBeInstanceOf(Date);
    expect(getTableColumns(account).updatedAt.onUpdateFn?.()).toBeInstanceOf(Date);
    expect(getTableColumns(verification).updatedAt.onUpdateFn?.()).toBeInstanceOf(Date);
  });

  it("resolves the session table's userId foreign key back to user.id", () => {
    const config = getTableConfig(session);
    expect(config.indexes.map((i) => i.config.name)).toContain("session_userId_idx");
    expect(config.foreignKeys).toHaveLength(1);
    const reference = config.foreignKeys[0].reference();
    expect(reference.foreignColumns[0].name).toBe("id");
  });

  it("resolves the account table's userId foreign key back to user.id", () => {
    const config = getTableConfig(account);
    expect(config.indexes.map((i) => i.config.name)).toContain("account_userId_idx");
    expect(config.foreignKeys).toHaveLength(1);
    const reference = config.foreignKeys[0].reference();
    expect(reference.foreignColumns[0].name).toBe("id");
  });

  it("builds the verification table's identifier index", () => {
    const config = getTableConfig(verification);
    expect(config.indexes.map((i) => i.config.name)).toContain("verification_identifier_idx");
  });
});
