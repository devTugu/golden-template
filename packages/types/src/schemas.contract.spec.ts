import { describe, expect, it } from "vitest";
import {
  CreateUserInputSchema,
  UpdateUserInputSchema,
  UserOutputSchema,
} from "./user";
import { RoleSchema } from "./role";

describe("@default/types contract schemas", () => {
  it("parses valid UserOutput", () => {
    const parsed = UserOutputSchema.parse({
      id: 1,
      email: "user@example.com",
      isActive: true,
      mfaEnabled: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      roles: ["ADMIN"],
      permissionCodes: ["USER_READ"],
    });
    expect(parsed.email).toBe("user@example.com");
  });

  it("rejects invalid UserOutput email", () => {
    expect(() =>
      UserOutputSchema.parse({
        id: 1,
        email: "not-an-email",
        isActive: true,
        mfaEnabled: false,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        roles: [],
        permissionCodes: [],
      }),
    ).toThrow();
  });

  it("parses CreateUserInput and rejects weak password", () => {
    expect(
      CreateUserInputSchema.parse({
        email: "new@example.com",
        password: "Str0ng!Pass",
        isActive: true,
      }).email,
    ).toBe("new@example.com");

    expect(() =>
      CreateUserInputSchema.parse({
        email: "new@example.com",
        password: "weak",
      }),
    ).toThrow();
  });

  it("allows partial UpdateUserInput", () => {
    expect(UpdateUserInputSchema.parse({ isActive: false }).isActive).toBe(
      false,
    );
  });

  it("parses Role entity", () => {
    const role = RoleSchema.parse({
      id: 2,
      name: "EDITOR",
      description: "Editor role",
      permissions: [],
    });
    expect(role.name).toBe("EDITOR");
  });
});
