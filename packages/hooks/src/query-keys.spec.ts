import { describe, expect, it } from "vitest";
import { userKeys } from "@default/api/query-keys";

describe("query key stability", () => {
  it("builds stable user list keys for identical params", () => {
    const params = { page: 1, limit: 10, search: "a" };
    expect(userKeys.list(params)).toEqual(userKeys.list({ ...params }));
  });

  it("separates detail keys by id", () => {
    expect(userKeys.detail(1)).not.toEqual(userKeys.detail(2));
  });
});
