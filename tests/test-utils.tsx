import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import type { ReactElement, ReactNode } from "react";
import { makeStore, type AppStore } from "@/lib/store/store";

type ExtendedRenderOptions = Omit<RenderOptions, "wrapper"> & {
  preloadedState?: Partial<ReturnType<AppStore["getState"]>>;
  store?: AppStore;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = makeStore(),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  if (preloadedState) {
    store = makeStore();
  }

  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
