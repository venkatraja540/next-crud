import itemsUiReducer, {
  resetForm,
  setDownloadFormat,
  setSearchQuery,
  setStatusMessage,
  startCreate,
  startEdit,
  updateFormField,
} from "@/lib/store/items-ui-slice";

describe("itemsUiSlice", () => {
  it("updates search query", () => {
    const state = itemsUiReducer(undefined, setSearchQuery("redux"));

    expect(state.searchQuery).toBe("redux");
  });

  it("enters edit mode with form values", () => {
    const state = itemsUiReducer(
      undefined,
      startEdit({
        id: "item-1",
        title: "Edit me",
        description: "Details",
      }),
    );

    expect(state.editingId).toBe("item-1");
    expect(state.form).toEqual({
      title: "Edit me",
      description: "Details",
    });
    expect(state.statusMessage).toBeNull();
  });

  it("updates individual form fields", () => {
    const state = itemsUiReducer(
      undefined,
      updateFormField({ field: "title", value: "Updated title" }),
    );

    expect(state.form.title).toBe("Updated title");
  });

  it("resets form and clears edit mode", () => {
    const editingState = itemsUiReducer(
      undefined,
      startEdit({
        id: "item-1",
        title: "Edit me",
        description: "Details",
      }),
    );

    const state = itemsUiReducer(editingState, resetForm());

    expect(state.editingId).toBeNull();
    expect(state.form).toEqual({ title: "", description: "" });
  });

  it("stores download format and status messages", () => {
    let state = itemsUiReducer(undefined, setDownloadFormat("csv"));
    state = itemsUiReducer(state, setStatusMessage("Saved"));

    expect(state.downloadFormat).toBe("csv");
    expect(state.statusMessage).toBe("Saved");
  });

  it("clears edit state when starting create", () => {
    const editingState = itemsUiReducer(
      undefined,
      startEdit({
        id: "item-1",
        title: "Edit me",
        description: "Details",
      }),
    );

    const state = itemsUiReducer(editingState, startCreate());

    expect(state.editingId).toBeNull();
    expect(state.form).toEqual({ title: "", description: "" });
    expect(state.statusMessage).toBeNull();
  });
});
