import { beforeEach, describe, expect, it, vi } from "vitest";
import { sampleItems } from "@/tests/fixtures/items";
import {
  createItemRequest,
  deleteItemRequest,
  fetchItems,
  updateItemRequest,
} from "@/lib/api/items";

describe("items api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleItems,
      }),
    );

    await expect(fetchItems()).resolves.toEqual(sampleItems);
    expect(fetch).toHaveBeenCalledWith("/api/items");
  });

  it("creates an item", async () => {
    const created = sampleItems[0];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => created,
      }),
    );

    await expect(
      createItemRequest({ title: "Learn Redux Toolkit", description: "Details" }),
    ).resolves.toEqual(created);

    expect(fetch).toHaveBeenCalledWith("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Learn Redux Toolkit",
        description: "Details",
      }),
    });
  });

  it("throws API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Title is required." }),
      }),
    );

    await expect(
      createItemRequest({ title: "", description: "" }),
    ).rejects.toThrow("Title is required.");
  });

  it("updates and deletes items", async () => {
    const updated = { ...sampleItems[0], title: "Updated" };

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => updated,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        }),
    );

    await expect(
      updateItemRequest("item-1", { title: "Updated" }),
    ).resolves.toEqual(updated);

    await expect(deleteItemRequest("item-1")).resolves.toBeUndefined();
  });
});
