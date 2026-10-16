import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VersionIndicator from "../../../features/sidebar/components/VersionIndicator.jsx";

describe("VersionIndicator", () => {
  it("renders a link if a url is available", () => {
    render(
      <VersionIndicator
        versionInfo={{
          label: "v1.0.0",
          sha: "abc",
          url: "https://github.com/a/b/tree/v1.0.0",
        }}
      />
    );
    const link = screen.getByRole("link", { name: "v1.0.0" });
    expect(link.getAttribute("href")).toBe(
      "https://github.com/a/b/tree/v1.0.0"
    );
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders plain text if the commit was not pushed", () => {
    render(
      <VersionIndicator
        versionInfo={{ label: "abc1234", sha: "abc1234", url: null }}
      />
    );
    expect(screen.getByText("abc1234")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
