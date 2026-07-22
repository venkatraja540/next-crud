import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ItemsManager from "@/components/items/items-manager";
import { createSampleItem, sampleItems } from "@/tests/fixtures/items";
import { renderWithProviders } from "@/tests/test-utils";

function mockItemsFetch(items = sampleItems) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.url;
      const method = init?.method ?? "GET";

      if (url === "/api/items" && method === "GET") {
        return {
          ok: true,
          json: async () => items,
        };
      }

      if (url === "/api/items" && method === "POST") {
        const body = JSON.parse(String(init?.body)) as {
          title: string;
          description: string;
        };
        const created = createSampleItem({
          id: "item-created",
          title: body.title,
          description: body.description,
        });

        items = [created, ...items];

        return {
          ok: true,
          json: async () => created,
        };
      }

      if (url.startsWith("/api/items/") && method === "PUT") {
        const id = url.split("/").pop() ?? "";
        const body = JSON.parse(String(init?.body)) as {
          title: string;
          description: string;
        };
        items = items.map((item) =>
          item.id === id
            ? {
                ...item,
                title: body.title,
                description: body.description,
                updatedAt: "2026-01-03T10:00:00.000Z",
              }
            : item,
        );
        const updated = items.find((item) => item.id === id);

        return {
          ok: true,
          json: async () => updated,
        };
      }

      if (url.startsWith("/api/items/") && method === "DELETE") {
        const id = url.split("/").pop() ?? "";
        items = items.filter((item) => item.id !== id);

        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      }

      return {
        ok: false,
        json: async () => ({ error: "Unhandled request in test." }),
      };
    }),
  );
}

describe("ItemsManager integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockItemsFetch([...sampleItems]);
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("loads and displays items from the API", async () => {
    renderWithProviders(<ItemsManager />);

    expect(await screen.findByText("Learn Redux Toolkit")).toBeInTheDocument();
    expect(screen.getByText("Learn React Query")).toBeInTheDocument();
  });

  it("creates a new item and shows a success message", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemsManager />);

    await screen.findByText("Learn Redux Toolkit");

    await user.type(screen.getByPlaceholderText("Enter a title"), "Vitest item");
    await user.type(
      screen.getByPlaceholderText("Optional description"),
      "Created from integration test",
    );
    await user.click(screen.getByRole("button", { name: "Add item" }));

    expect(await screen.findByText("Vitest item")).toBeInTheDocument();
    expect(screen.getByText("Item created.")).toBeInTheDocument();
  });

  it("filters the list using Redux search state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemsManager />);

    await screen.findByText("Learn Redux Toolkit");

    await user.type(
      screen.getByPlaceholderText("Filter by title or description"),
      "react query",
    );

    expect(screen.queryByText("Learn Redux Toolkit")).not.toBeInTheDocument();
    expect(screen.getByText("Learn React Query")).toBeInTheDocument();
  });

  it("enters edit mode and updates an item", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemsManager />);

    const itemCard = await screen.findByRole("listitem", {
      name: (_, element) => element.textContent?.includes("Learn Redux Toolkit") ?? false,
    });

    await user.click(within(itemCard).getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("heading", { name: "Edit item" })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText("Enter a title");
    await user.clear(titleInput);
    await user.type(titleInput, "Redux updated");
    await user.click(screen.getByRole("button", { name: "Update item" }));

    expect(await screen.findByText("Redux updated")).toBeInTheDocument();
    expect(screen.getByText("Item updated.")).toBeInTheDocument();
  });

  it("deletes an item after confirmation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemsManager />);

    const itemCard = await screen.findByRole("listitem", {
      name: (_, element) => element.textContent?.includes("Learn React Query") ?? false,
    });

    await user.click(within(itemCard).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("Learn React Query")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Item deleted.")).toBeInTheDocument();
  });

  it("downloads the current list", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const link = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement;

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      if (tagName === "a") {
        return link;
      }

      return originalCreateElement(tagName, options);
    });

    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
      if (node === link) {
        return link;
      }

      return originalAppendChild(node);
    });

    renderWithProviders(<ItemsManager />);
    await screen.findByText("Learn Redux Toolkit");

    await user.click(screen.getByRole("button", { name: "Download list" }));

    expect(link.click).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Downloaded 2 item(s) as JSON.")).toBeInTheDocument();
  });
});
