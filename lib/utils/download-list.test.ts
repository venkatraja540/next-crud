import { describe, expect, it, vi } from "vitest";
import { sampleItems } from "@/tests/fixtures/items";
import { downloadItemsList } from "@/lib/utils/download-list";

describe("downloadItemsList", () => {
  it("downloads JSON content with the expected filename", () => {
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const link = {
      href: "",
      download: "",
      click,
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement;

    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(link);
    const appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => link);

    downloadItemsList(sampleItems, "json");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toContain("application/json");

    expect(link.download).toMatch(/^items-list-.*\.json$/);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("downloads CSV content with escaped values", () => {
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const link = {
      href: "",
      download: "",
      click,
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, "createElement").mockReturnValue(link);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => link);

    downloadItemsList(
      [
        {
          ...sampleItems[0],
          title: 'Title, with "quotes"',
          description: "Line\nbreak",
        },
      ],
      "csv",
    );

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toContain("text/csv");
    expect(link.download).toMatch(/^items-list-.*\.csv$/);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    vi.unstubAllGlobals();
  });
});
