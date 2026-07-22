import { beforeEach, describe, expect, it } from "vitest";
import { sampleItems } from "@/tests/fixtures/items";
import {
  createItem,
  deleteItem,
  getAllItems,
  getItemById,
  resetItemsStore,
  updateItem,
} from "@/lib/data/items-store";

describe("items-store", () => {
  beforeEach(() => {
    resetItemsStore(sampleItems);
  });

  it("returns seeded items sorted by updatedAt descending", () => {
    const items = getAllItems();

    expect(items).toHaveLength(2);
    expect(items[0]?.id).toBe("item-2");
    expect(items[1]?.id).toBe("item-1");
  });

  it("creates a trimmed item", () => {
    const item = createItem({
      title: "  New title  ",
      description: "  New description  ",
    });

    expect(item.title).toBe("New title");
    expect(item.description).toBe("New description");
    expect(getItemById(item.id)).toEqual(item);
  });

  it("updates an existing item", () => {
    const updated = updateItem("item-1", {
      title: "Updated title",
      description: "Updated description",
    });

    expect(updated?.title).toBe("Updated title");
    expect(updated?.description).toBe("Updated description");
    expect(updated?.updatedAt).not.toBe(sampleItems[0].updatedAt);
  });

  it("returns null when updating a missing item", () => {
    expect(updateItem("missing-id", { title: "Nope" })).toBeNull();
  });

  it("deletes an item", () => {
    expect(deleteItem("item-1")).toBe(true);
    expect(getItemById("item-1")).toBeUndefined();
    expect(getAllItems()).toHaveLength(1);
  });
});
