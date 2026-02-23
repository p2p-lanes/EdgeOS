import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { ApiError, OpenAPI } from "./client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { routeTree } from "./routeTree.gen"

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

// Add X-Tenant-Id header for superadmin tenant context using request interceptor
// This ensures the header is added fresh on every request
OpenAPI.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem("workspace_tenant_id")
  if (tenantId) {
    config.headers = {
      ...config.headers,
      "X-Tenant-Id": tenantId,
    }
  }
  return config
})

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && error.status === 401) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }
  // Don't redirect on 403 - it could mean tenant not selected (superadmin)
  // Let the UI handle showing the tenant selector
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
    },
  },
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
