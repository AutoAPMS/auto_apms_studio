import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadXml } from "../../../../services/downloadService.js";

describe("downloadXml (no jsdom)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Blob",
      vi.fn(function (content, options) {
        this.content = content;
        this.options = options;
      })
    );

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "mock-url"),
      revokeObjectURL: vi.fn(),
    });

    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        href: "",
        download: "",
        click: vi.fn(),
      })),
    });
  });

  it("creates download link and triggers click", () => {
    downloadXml("<xml/>", "file");

    expect(Blob).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();

    const link = document.createElement.mock.results[0].value;
    expect(link.click).toHaveBeenCalled();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("mock-url");
  });

  it("sets filename correctly", () => {
    downloadXml("<xml/>", "myTree");

    const link = document.createElement.mock.results[0].value;
    expect(link.download).toBe("myTree.xml");
  });

  it("does nothing when xmlContent is empty", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    downloadXml("", "file");

    expect(warnSpy).toHaveBeenCalledWith("No XML content to download");
    expect(document.createElement).not.toHaveBeenCalled();
  });
});
