import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useUsers } from "./user/use-users";

vi.mock("@default/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@default/api")>();
  return {
    ...actual,
    listUsers: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  };
});

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("useUsers", () => {
  it("returns data from listUsers", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(
      () => useUsers({ page: 1, limit: 10 }),
      { wrapper: wrapper(client) },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ data: [], total: 0 });
  });
});
