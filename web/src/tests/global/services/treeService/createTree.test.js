import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock dependencies ---
vi.mock("../../../../store/treeStore", () => ({
  useStore: {
    getState: vi.fn(),
  },
}));

vi.mock("../../../../services/jsonService", () => ({
  addTreeToSavedJson: vi.fn(),
}));

import { useStore } from "../../../../store/treeStore.js";
import { addTreeToSavedJson } from "../../../../services/jsonService.js";
import { createTreeAndUpdateStore } from "../../../../services/treeService.js";
import { EMPTY_TREE_TEMPLATE_Json } from "../../../../features/sidebar/constants.js";

describe("createTreeAndUpdateStore", () => {
  let mockState;

  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      trees: [],
      xmlDeclaration: { test: "xml" },
      rootAttrs: { test: "root" },

      setSelectedTree: vi.fn(),
      setSavedJson: vi.fn(),
      setParsedData: vi.fn(),
    };

    useStore.getState.mockReturnValue(mockState);

    addTreeToSavedJson.mockReturnValue({
      savedJson: ["json"],
      rootAttrs: { updated: true },
      xmlDeclaration: { updated: true },
    });
  });

  // ---------- Test 1 ----------

  it("creates a new tree and updates store", () => {
    createTreeAndUpdateStore("Test Tree", EMPTY_TREE_TEMPLATE_Json.treeData);

    const expectedTree = {
      id: "Test Tree",
      treeData: EMPTY_TREE_TEMPLATE_Json.treeData,
    };

    expect(addTreeToSavedJson).toHaveBeenCalledWith(
      expectedTree,
      mockState.trees,
      mockState.rootAttrs,
      mockState.xmlDeclaration
    );

    expect(mockState.setSavedJson).toHaveBeenCalledWith(["json"]);

    expect(mockState.setParsedData).toHaveBeenCalledWith({
      trees: [expectedTree],
      rootAttrs: { updated: true },
      xmlDeclaration: { updated: true },
    });
  });

  // ---------- Test 2 ----------

  it("handles empty initial store safely", () => {
    mockState.trees = [];
    mockState.rootAttrs = null;
    mockState.xmlDeclaration = null;

    createTreeAndUpdateStore(
      "new empty tree",
      EMPTY_TREE_TEMPLATE_Json.treeData
    );

    expect(addTreeToSavedJson).toHaveBeenCalled();
    expect(mockState.setSavedJson).toHaveBeenCalled();
    expect(mockState.setParsedData).toHaveBeenCalled();
  });
});
