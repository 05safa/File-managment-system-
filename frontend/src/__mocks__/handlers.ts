import { http, HttpResponse } from "msw";

export const handlers = [
  // Login endpoint
  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email && body.password) {
      return HttpResponse.json(
        {
          user: {
            id: "1",
            email: body.email,
            username: body.email.split("@")[0],
            role: body.email.includes("admin") ? "admin" : "user",
          },
          token: "fake-jwt-token",
        },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }),

  // Get documents
  http.get("/api/documents", () => {
    return HttpResponse.json(
      {
        documents: [
          {
            id: "1",
            title: "Project Proposal",
            description: "Q4 project proposal",
            status: "approved",
            files: [
              { id: "1", name: "proposal.pdf", size: 2048 },
              { id: "2", name: "budget.xlsx", size: 1024 },
            ],
            comments: [
              { id: "1", author: "Alice", text: "Looks good!", timestamp: new Date().toISOString() },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Budget Review",
            description: "2025 Budget Review",
            status: "review",
            files: [{ id: "3", name: "budget2025.xlsx", size: 3072 }],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Meeting Notes",
            description: "Team meeting notes",
            status: "draft",
            files: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      { status: 200 }
    );
  }),

  // Create document
  http.post("/api/documents", async ({ request }) => {
    const body = await request.json() as { title: string; description: string };
    
    return HttpResponse.json(
      {
        id: String(Math.random()),
        title: body.title,
        description: body.description,
        status: "draft",
        files: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Update document
  http.put("/api/documents/:id", async ({ request, params }) => {
    const body = await request.json() as { status?: string };
    
    return HttpResponse.json(
      {
        id: params.id,
        title: "Updated Document",
        description: "Updated description",
        status: body.status || "draft",
        files: [],
        comments: [],
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }),

  // Delete document
  http.delete("/api/documents/:id", () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
