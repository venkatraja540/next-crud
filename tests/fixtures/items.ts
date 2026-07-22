import type { Item } from "@/lib/types/item";

export const sampleItems: Item[] = [
  {
    id: "item-1",
    title: "Learn Redux Toolkit",
    description: "Understand slices, reducers, and the store.",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "item-2",
    title: "Learn React Query",
    description: "Fetch, cache, and mutate server data with useQuery.",
    createdAt: "2026-01-01T11:00:00.000Z",
    updatedAt: "2026-01-01T11:00:00.000Z",
  },
];

export function createSampleItem(overrides: Partial<Item> = {}): Item {
  return {
    id: "item-new",
    title: "New Item",
    description: "A new description",
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
    ...overrides,
  };
}
