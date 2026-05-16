import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe("useAuth hook with MSW", () => {
  it("should be unauthenticated initially", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should authenticate user with valid credentials", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.login("test@company.com", "password", "user");

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe("test@company.com");
    });
  });

  it("should logout user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.login("test@company.com", "password", "user");
    result.current.logout();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
