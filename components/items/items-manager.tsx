"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FormEvent, useMemo } from "react";
import {
  createItemRequest,
  deleteItemRequest,
  fetchItems,
  updateItemRequest,
} from "@/lib/api/items";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  resetForm,
  setDownloadFormat,
  setSearchQuery,
  setStatusMessage,
  startCreate,
  startEdit,
  updateFormField,
} from "@/lib/store/items-ui-slice";
import type { Item } from "@/lib/types/item";
import { downloadItemsList } from "@/lib/utils/download-list";

const ITEMS_QUERY_KEY = ["items"] as const;

export default function ItemsManager() {
  const dispatch = useAppDispatch();
  const { searchQuery, editingId, form, downloadFormat, statusMessage } =
    useAppSelector((state) => state.itemsUi);
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: fetchItems,
  });

  const createMutation = useMutation({
    mutationFn: createItemRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      dispatch(resetForm());
      dispatch(setStatusMessage("Item created."));
    },
    onError: (error: Error) => {
      dispatch(setStatusMessage(error.message));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      title,
      description,
    }: {
      id: string;
      title: string;
      description: string;
    }) => updateItemRequest(id, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      dispatch(resetForm());
      dispatch(setStatusMessage("Item updated."));
    },
    onError: (error: Error) => {
      dispatch(setStatusMessage(error.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      dispatch(setStatusMessage("Item deleted."));
    },
    onError: (error: Error) => {
      dispatch(setStatusMessage(error.message));
    },
  });

  const filteredItems = useMemo(() => {
    const items = itemsQuery.data ?? [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) return items;

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [itemsQuery.data, searchQuery]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      dispatch(setStatusMessage("Title is required."));
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, title, description });
      return;
    }

    createMutation.mutate({ title, description });
  }

  function handleDownload() {
    const items = itemsQuery.data ?? [];

    if (items.length === 0) {
      dispatch(setStatusMessage("Nothing to download yet."));
      return;
    }

    downloadItemsList(items, downloadFormat);
    dispatch(
      setStatusMessage(
        `Downloaded ${items.length} item(s) as ${downloadFormat.toUpperCase()}.`,
      ),
    );
  }

  function handleDelete(item: Item) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    deleteMutation.mutate(item.id);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          CRUD Demo
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Items list with Redux Toolkit + React Query
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Create, read, update, and delete items. Filter the list in Redux, fetch
          with useQuery, and download the final list as JSON or CSV.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {editingId ? "Edit item" : "Create item"}
            </h2>
            {editingId ? (
              <button
                type="button"
                onClick={() => dispatch(startCreate())}
                className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Title
              </span>
              <input
                value={form.title}
                onChange={(event) =>
                  dispatch(
                    updateFormField({
                      field: "title",
                      value: event.target.value,
                    }),
                  )
                }
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Enter a title"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  dispatch(
                    updateFormField({
                      field: "description",
                      value: event.target.value,
                    }),
                  )
                }
                rows={4}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Optional description"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isSaving ? "Saving..." : editingId ? "Update item" : "Add item"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Search list
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) =>
                    dispatch(setSearchQuery(event.target.value))
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  placeholder="Filter by title or description"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Download format
                </span>
                <select
                  value={downloadFormat}
                  onChange={(event) =>
                    dispatch(
                      setDownloadFormat(event.target.value as "json" | "csv"),
                    )
                  }
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </label>

              <button
                type="button"
                onClick={handleDownload}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Download list
              </button>
            </div>
          </div>

          {statusMessage ? (
            <p className="mb-4 rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              {statusMessage}
            </p>
          ) : null}

          {itemsQuery.isLoading ? (
            <p className="text-sm text-zinc-500">Loading items...</p>
          ) : itemsQuery.isError ? (
            <p className="text-sm text-red-600">
              {(itemsQuery.error as Error).message}
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="text-sm text-zinc-500">No items match your search.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.description || "No description"}
                      </p>
                      <p className="mt-2 text-xs text-zinc-400">
                        Updated {new Date(item.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            startEdit({
                              id: item.id,
                              title: item.title,
                              description: item.description,
                            }),
                          )
                        }
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
