import { configureStore } from "@reduxjs/toolkit";
import itemsUiReducer from "@/lib/store/items-ui-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      itemsUi: itemsUiReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
