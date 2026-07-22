import type { DownloadFormat, Item } from "@/lib/types/item";

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function itemsToCsv(items: Item[]): string {
  const header = "id,title,description,createdAt,updatedAt";
  const rows = items.map((item) =>
    [
      item.id,
      item.title,
      item.description,
      item.createdAt,
      item.updatedAt,
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  return [header, ...rows].join("\n");
}

export function downloadItemsList(items: Item[], format: DownloadFormat) {
  const content =
    format === "json"
      ? JSON.stringify(items, null, 2)
      : itemsToCsv(items);

  const mimeType = format === "json" ? "application/json" : "text/csv";
  const extension = format === "json" ? "json" : "csv";
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  link.href = url;
  link.download = `items-list-${timestamp}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
