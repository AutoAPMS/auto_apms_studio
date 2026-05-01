import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTreeExport } from "../../../features/sidebar/hooks/useTreeExport.js";

vi.mock("../../../store/treeStore", () => ({
  useStore: vi.fn((selector) =>
    selector({
      trees: { "my-tree": { id: "1", name: "Root" } },
    })
  ),
}));

vi.mock("../../../services/xmlService", () => ({
  buildJsonToXml: vi.fn(() => "<xml>content</xml>"),
}));

vi.mock("../../../services/jsonService", () => ({
  buildDeployJson: vi.fn(() => ({ some: "json" })),
}));

vi.mock("../../../services/downloadService", () => ({
  downloadXml: vi.fn(),
}));

import { downloadXml } from "../../../services/downloadService";

describe("useTreeExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export tree as XML", () => {
    const { result } = renderHook(() => useTreeExport({}, {}));
    const { exportTree } = result.current;

    const treeData = {
      id: "1",
      name: "Root",
      children: [
        { id: "2", name: "Child 1" },
        { id: "3", name: "Child 2" },
      ],
    };

    exportTree(treeData, "my-tree");

    expect(downloadXml).toHaveBeenCalled();
  });

  it("should not call downloadXml if there is no tree", () => {
    const { result } = renderHook(() => useTreeExport({}, {}));
    const { exportTree } = result.current;

    exportTree(null, "my-tree");

    expect(downloadXml).not.toHaveBeenCalled();
  });

  it("should show alert if export fails", () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { result } = renderHook(() => useTreeExport({}, {}));
    const { exportTree } = result.current;

    downloadXml.mockImplementation(() => {
      throw new Error("Export failed");
    });

    const treeData = { id: "1", name: "Root" };
    exportTree(treeData, "my-tree");

    expect(alertMock).toHaveBeenCalledWith(
      "Failed to export tree. Check console for details."
    );

    alertMock.mockRestore();
  });
});
