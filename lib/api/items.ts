import type { CreateItemInput, Item, UpdateItemInput } from "@/lib/types/item";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed.",
    );
  }

  return data as T;
}

export async function fetchItems(): Promise<Item[]> {
  const response = await fetch("/api/items");
  return parseResponse<Item[]>(response);
}

export async function createItemRequest(input: CreateItemInput): Promise<Item> {
  const response = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<Item>(response);
}

export async function updateItemRequest(
  id: string,
  input: UpdateItemInput,
): Promise<Item> {
  const response = await fetch(`/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<Item>(response);
}

export async function deleteItemRequest(id: string): Promise<void> {
  const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
  await parseResponse<{ success: boolean }>(response);
}
