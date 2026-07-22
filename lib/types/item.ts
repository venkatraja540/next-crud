export type Item = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateItemInput = {
  title: string;
  description: string;
};

export type UpdateItemInput = {
  title?: string;
  description?: string;
};

export type DownloadFormat = "json" | "csv";
