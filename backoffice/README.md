# Backoffice

React-based admin dashboard for managing tenants, popups, applications, and more.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: TanStack Router (file-based)
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: Bun

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Open http://localhost:5173
```

## Project Structure

```
backoffice/
├── src/
│   ├── routes/                 # File-based routing (TanStack Router)
│   │   ├── __root.tsx          # Root layout
│   │   ├── _layout.tsx         # Authenticated layout (sidebar, header)
│   │   ├── _layout/            # Protected routes
│   │   │   ├── index.tsx       # Dashboard
│   │   │   ├── popups/         # Popup management
│   │   │   ├── applications/   # Application management
│   │   │   ├── attendees.tsx   # Attendee list
│   │   │   ├── products/       # Product management
│   │   │   ├── coupons/        # Coupon management
│   │   │   ├── groups/         # Group management
│   │   │   ├── humans/         # Human/end-user management
│   │   │   ├── form-builder/   # Custom form fields
│   │   │   ├── admin/          # User management
│   │   │   ├── tenants/        # Tenant management (superadmin)
│   │   │   └── settings.tsx    # User settings
│   │   └── login.tsx           # Login page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Form components (TanStack Form)
│   │   ├── Sidebar/            # Navigation sidebar
│   │   ├── Common/             # Shared components
│   │   ├── Admin/              # Admin-specific components
│   │   └── UserSettings/       # Settings components
│   ├── client/                 # Auto-generated OpenAPI client (DO NOT EDIT)
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React contexts
│   └── lib/                    # Utility functions
├── public/                     # Static assets
└── index.html                  # Entry HTML
```

## Available Scripts

```bash
bun run dev           # Start dev server (localhost:5173)
bun run build         # Production build
bun run preview       # Preview production build
bun run lint          # Run Biome linter
bun run generate-client  # Regenerate OpenAPI client from backend
```

## Routing

Routes use TanStack Router's file-based routing:

| Route | File | Description |
|-------|------|-------------|
| `/login` | `login.tsx` | Login page |
| `/` | `_layout/index.tsx` | Dashboard |
| `/popups` | `_layout/popups/index.tsx` | Popup list |
| `/popups/new` | `_layout/popups/new.tsx` | Create popup |
| `/popups/:id/edit` | `_layout/popups/$id.edit.tsx` | Edit popup |
| `/applications` | `_layout/applications/index.tsx` | Application list |
| `/attendees` | `_layout/attendees.tsx` | Attendee list |
| `/products` | `_layout/products/index.tsx` | Product list |
| `/coupons` | `_layout/coupons/index.tsx` | Coupon list |
| `/groups` | `_layout/groups/index.tsx` | Group list |
| `/humans` | `_layout/humans/index.tsx` | Human list |
| `/form-builder` | `_layout/form-builder/index.tsx` | Form fields |
| `/admin` | `_layout/admin/index.tsx` | User management |
| `/tenants` | `_layout/tenants/index.tsx` | Tenant management |
| `/settings` | `_layout/settings.tsx` | User settings |

## API Client

The OpenAPI client is auto-generated from the backend schema. **Do not edit files in `src/client/` manually.**

### Regenerating the Client

After backend API changes:

```bash
# Ensure backend is running
docker compose up -d backend

# Regenerate client
bun run generate-client
```

### Usage Example

```tsx
import { PopupsService } from "@/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ["popups"],
  queryFn: () => PopupsService.listPopups(),
})

// Mutate data
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: (data: PopupCreate) => PopupsService.createPopup({ requestBody: data }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["popups"] }),
})
```

## Forms

Forms use TanStack Form for validation and state management:

```tsx
import { useForm } from "@tanstack/react-form"

const form = useForm({
  defaultValues: {
    name: "",
    slug: "",
  },
  onSubmit: ({ value }) => {
    mutation.mutate(value)
  },
})

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
    <form.Field name="name">
      {(field) => (
        <Input
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      )}
    </form.Field>
  </form>
)
```

## Authentication

Authentication is handled via the `useAuth` hook:

```tsx
import { useAuth } from "@/hooks/useAuth"

const { user, isLoggedIn, isAdmin, isSuperadmin, logout } = useAuth()

// Route protection is in _layout.tsx
// Role-based UI
if (isSuperadmin(user)) {
  // Show superadmin features
}
```

## Context Providers

### WorkspaceContext

Manages the currently selected popup:

```tsx
import { useWorkspace } from "@/contexts/WorkspaceContext"

const { currentPopup, setCurrentPopup } = useWorkspace()
```

## UI Components

UI components are from [shadcn/ui](https://ui.shadcn.com/). They live in `src/components/ui/`.

To add new shadcn components:

```bash
bunx shadcn@latest add <component-name>
```

## Styling

Uses Tailwind CSS. Configuration in `tailwind.config.js`.

```tsx
<div className="flex items-center gap-4 p-4 bg-background text-foreground">
  <Button variant="default">Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (e.g., `http://localhost:8000`) |

Configure in `.env`:

```bash
VITE_API_URL=http://localhost:8000
```

## Building for Production

```bash
# Create production build
bun run build

# Preview locally
bun run preview

# Build outputs to dist/
```

The Dockerfile builds a production image with nginx serving the static files.

## Code Style

Uses Biome for linting and formatting:

```bash
bun run lint          # Check and auto-fix
```

Configuration in `biome.json`:
- Double quotes for strings
- No semicolons
- Space indentation
