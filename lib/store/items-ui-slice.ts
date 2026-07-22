import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DownloadFormat } from "@/lib/types/item";

type ItemFormState = {
  title: string;
  description: string;
};

type ItemsUiState = {
  searchQuery: string;
  editingId: string | null;
  form: ItemFormState;
  downloadFormat: DownloadFormat;
  statusMessage: string | null;
};

const initialState: ItemsUiState = {
  searchQuery: "",
  editingId: null,
  form: {
    title: "",
    description: "",
  },
  downloadFormat: "json",
  statusMessage: null,
};

const itemsUiSlice = createSlice({
  name: "itemsUi",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setDownloadFormat(state, action: PayloadAction<DownloadFormat>) {
      state.downloadFormat = action.payload;
    },
    setStatusMessage(state, action: PayloadAction<string | null>) {
      state.statusMessage = action.payload;
    },
    startCreate(state) {
      state.editingId = null;
      state.form = { title: "", description: "" };
      state.statusMessage = null;
    },
    startEdit(
      state,
      action: PayloadAction<{ id: string; title: string; description: string }>,
    ) {
      state.editingId = action.payload.id;
      state.form = {
        title: action.payload.title,
        description: action.payload.description,
      };
      state.statusMessage = null;
    },
    updateFormField(
      state,
      action: PayloadAction<{ field: keyof ItemFormState; value: string }>,
    ) {
      state.form[action.payload.field] = action.payload.value;
    },
    resetForm(state) {
      state.editingId = null;
      state.form = { title: "", description: "" };
    },
  },
});

export const {
  setSearchQuery,
  setDownloadFormat,
  setStatusMessage,
  startCreate,
  startEdit,
  updateFormField,
  resetForm,
} = itemsUiSlice.actions;

export default itemsUiSlice.reducer;
