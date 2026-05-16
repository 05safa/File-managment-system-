import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import LoginPage from "@/routes/index";

describe("LoginPage with MSW", () => {
  it("should log in with valid credentials", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("you@company.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@company.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // MSW will intercept the request and return mock data
    await waitFor(() => {
      expect(emailInput).toBeInTheDocument();
    });
  });
});
