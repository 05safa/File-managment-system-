# API Mocking with Mock Service Worker (MSW)

This project uses **Mock Service Worker (MSW)** to mock API calls for testing and development.

## Setup

All the MSW files are already configured in `src/__mocks__/`:
- `handlers.ts` — Defines mock API endpoints
- `browser.ts` — MSW setup for browser/development
- `server.ts` — MSW setup for Node.js/tests
- `setup.ts` — Test environment setup

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Using in Development

### Option 1: Enable MSW in Development (Optional)

If you want to test with mock APIs during development, update your `src/main.tsx`:

```tsx
import { App } from "./App";
import { worker } from "./__mocks__/browser";

if (process.env.NODE_ENV === "development") {
  // Uncomment to enable MSW in dev
  // worker.start();
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Option 2: Use Real API Endpoints

By default, the app will work with real API endpoints when in development mode.

## Mocking API Endpoints

All mock handlers are in `src/__mocks__/handlers.ts`. Examples:

### Add a new mock endpoint

```typescript
// src/__mocks__/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users/:id", ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: "John Doe",
      email: "john@example.com",
    });
  }),

  // ... other handlers
];
```

### Override handlers in tests

```typescript
import { describe, it, expect } from "vitest";
import { server } from "@/__mocks__/server";
import { http, HttpResponse } from "msw";

describe("Custom API behavior", () => {
  it("should handle failed login", async () => {
    server.use(
      http.post("/api/auth/login", () => {
        return HttpResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      })
    );

    // Your test here
  });
});
```

## Example Tests

Test files are located in their respective directories with `.test.tsx` suffix:
- `src/routes/index.test.tsx` — Login page tests
- `src/lib/auth-context.test.tsx` — Auth hook tests

## Reference

- [MSW Documentation](https://mswjs.io/)
- [Testing Library Documentation](https://testing-library.com/)
- [Vitest Documentation](https://vitest.dev/)
