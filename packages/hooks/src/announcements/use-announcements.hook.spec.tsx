import { describe, expect, it } from "vitest";
import { announcementKeys } from "@default/api/query-keys";

describe("announcementKeys", () => {
  it("builds stable list keys", () => {
    const params = { page: 1, limit: 10 };
    expect(announcementKeys.list(params)).toEqual(
      announcementKeys.list({ ...params }),
    );
  });
});
