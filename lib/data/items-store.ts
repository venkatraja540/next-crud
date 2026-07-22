import type { CreateItemInput, Item, UpdateItemInput } from "@/lib/types/item";

const items = new Map<string, Item>();

function seedItems() {
  if (items.size > 0) return;

  const now = new Date().toISOString();
  const samples: Item[] = [
    {
      id: crypto.randomUUID(),
      title: "Learn Redux Toolkit",
      description: "Understand slices, reducers, and the store.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Learn React Query",
      description: "Fetch, cache, and mutate server data with useQuery.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const item of samples) {
    items.set(item.id, item);
  }
}

seedItems();

export function getAllItems(): Item[] {
  return Array.from(items.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getItemById(id: string): Item | undefined {
  return items.get(id);
}

export function createItem(input: CreateItemInput): Item {
  const now = new Date().toISOString();
  const item: Item = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    createdAt: now,
    updatedAt: now,
  };

  items.set(item.id, item);
  return item;
}

export function updateItem(id: string, input: UpdateItemInput): Item | null {
  const existing = items.get(id);
  if (!existing) return null;

  const updated: Item = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    description:
      input.description !== undefined
        ? input.description.trim()
        : existing.description,
    updatedAt: new Date().toISOString(),
  };

  items.set(id, updated);
  return updated;
}

export function deleteItem(id: string): boolean {
  return items.delete(id);
}

export function resetItemsStore(seed: Item[] = []): void {
  items.clear();

  for (const item of seed) {
    items.set(item.id, item);
  }
}
