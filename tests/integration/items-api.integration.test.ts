import { beforeEach, describe, expect, it } from "vitest";
import { GET as getItems, POST as createItemRoute } from "@/app/api/items/route";
import {
  DELETE as deleteItemRoute,
  GET as getItemByIdRoute,
  PUT as updateItemRoute,
} from "@/app/api/items/[id]/route";
import { resetItemsStore } from "@/lib/data/items-store";
import { createSampleItem, sampleItems } from "@/tests/fixtures/items";

describe("items API routes integration", () => {
  beforeEach(() => {
    resetItemsStore(sampleItems);
  });

  it("lists items through GET /api/items", async () => {
    const response = await getItems();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]?.id).toBe("item-2");
  });

  it("creates an item through POST /api/items", async () => {
    const request = new Request("http://localhost/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Integration item",
        description: "Created in test",
      }),
    });

    const response = await createItemRoute(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe("Integration item");
    expect(data.description).toBe("Created in test");
  });

  it("rejects create requests without a title", async () => {
    const request = new Request("http://localhost/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   ", description: "Missing title" }),
    });

    const response = await createItemRoute(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Title is required.");
  });

  it("reads, updates, and deletes an item by id", async () => {
    const item = createSampleItem({ id: "item-99" });
    resetItemsStore([item]);

    const getResponse = await getItemByIdRoute(new Request("http://localhost"), {
      params: Promise.resolve({ id: "item-99" }),
    });
    expect(getResponse.status).toBe(200);
    expect(await getResponse.json()).toMatchObject({ title: "New Item" });

    const updateRequest = new Request("http://localhost/api/items/item-99", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated in test" }),
    });

    const updateResponse = await updateItemRoute(updateRequest, {
      params: Promise.resolve({ id: "item-99" }),
    });
    expect(updateResponse.status).toBe(200);
    expect(await updateResponse.json()).toMatchObject({
      title: "Updated in test",
    });

    const deleteResponse = await deleteItemRoute(new Request("http://localhost"), {
      params: Promise.resolve({ id: "item-99" }),
    });
    expect(deleteResponse.status).toBe(200);
    expect(await deleteResponse.json()).toEqual({ success: true });

    const missingResponse = await getItemByIdRoute(new Request("http://localhost"), {
      params: Promise.resolve({ id: "item-99" }),
    });
    expect(missingResponse.status).toBe(404);
  });
});
