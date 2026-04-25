import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MetodologiaPage from "./page";

describe("Metodologia page", () => {
  it("reuses the branded alcala logo in the header", () => {
    render(<MetodologiaPage />);

    expect(screen.getByTestId("alcala-logo")).toBeInTheDocument();
  });
});
