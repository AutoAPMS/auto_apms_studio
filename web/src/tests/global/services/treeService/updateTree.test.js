import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setTreesInStore,
  updateTreeInStore,
} from "../../../../services/treeService.js";
import { useStore } from "../../../../store/treeStore.js";
import { buildSavedJson } from "../../../../services/jsonService.js";

vi.mock("../../../../store/treeStore.js", () => ({
  useStore: {
    getState: vi.fn(),
  },
}));

vi.mock("../../../../services/jsonService.js", () => ({
  buildSavedJson: vi.fn(),
}));

describe("updateTreeInStore", () => {
  let mockSetSavedJson;
  let mockSetParsedData;

  beforeEach(() => {
    mockSetSavedJson = vi.fn();
    mockSetParsedData = vi.fn();
    buildSavedJson.mockReturnValue({ mocked: "json" });
    vi.clearAllMocks();
  });

  it("should update the correct tree by ID and call store methods", () => {
    const existingTrees = [
      { id: "tree1", treeData: { BehaviorTree: { OldNode: [] } } },
      { id: "tree2", treeData: { BehaviorTree: { AnotherNode: [] } } },
    ];

    useStore.getState.mockReturnValue({
      trees: existingTrees,
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: { "@_version": "1.0" },
      setSavedJson: mockSetSavedJson,
      setParsedData: mockSetParsedData,
    });

    const updatedTree = {
      id: "tree1",
      treeData: { BehaviorTree: { NewNode: [] } },
    };

    updateTreeInStore("tree1", updatedTree);

    expect(mockSetParsedData).toHaveBeenCalledWith({
      trees: [updatedTree, existingTrees[1]],
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: { "@_version": "1.0" },
    });

    expect(mockSetSavedJson).toHaveBeenCalledWith({ mocked: "json" });
  });

  it("should handle null rootAttrs by passing empty object to buildSavedJson", () => {
    useStore.getState.mockReturnValue({
      trees: [{ id: "t1", treeData: {} }],
      rootAttrs: null,
      xmlDeclaration: { "@_version": "1.0" },
      setSavedJson: mockSetSavedJson,
      setParsedData: mockSetParsedData,
    });

    updateTreeInStore("t1", { id: "t1", treeData: { updated: true } });

    expect(buildSavedJson).toHaveBeenCalledWith({
      trees: expect.any(Array),
      rootAttrs: {},
      xmlDeclaration: { "@_version": "1.0" },
    });
  });

  it("should not modify other trees when updating one", () => {
    const tree1 = { id: "a", treeData: { A: [] } };
    const tree2 = { id: "b", treeData: { B: [] } };
    const tree3 = { id: "c", treeData: { C: [] } };

    useStore.getState.mockReturnValue({
      trees: [tree1, tree2, tree3],
      rootAttrs: {},
      xmlDeclaration: {},
      setSavedJson: mockSetSavedJson,
      setParsedData: mockSetParsedData,
    });

    const updatedTree2 = { id: "b", treeData: { BUpdated: [] } };
    updateTreeInStore("b", updatedTree2);

    const result = mockSetParsedData.mock.calls[0][0].trees;
    expect(result[0]).toBe(tree1);
    expect(result[1]).toBe(updatedTree2);
    expect(result[2]).toBe(tree3);
  });
});

describe("setTreesInStore", () => {
  let mockSetSavedJson;
  let mockSetParsedData;

  beforeEach(() => {
    mockSetSavedJson = vi.fn();
    mockSetParsedData = vi.fn();
    buildSavedJson.mockReturnValue({ mocked: "json" });
    vi.clearAllMocks();
  });

  it("should handle null rootAttrs by passing empty object to buildSavedJson", () => {
    useStore.getState.mockReturnValue({
      rootAttrs: null,
      xmlDeclaration: { "@_version": "1.0" },
      setSavedJson: mockSetSavedJson,
      setParsedData: mockSetParsedData,
    });

    setTreesInStore([{ id: "t1", treeData: { updated: true } }]);

    expect(buildSavedJson).toHaveBeenCalledWith({
      trees: expect.any(Array),
      rootAttrs: {},
      xmlDeclaration: { "@_version": "1.0" },
    });
  });

  it("should set the store to the given trees", () => {
    useStore.getState.mockReturnValue({
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: { "@_version": "1.0" },
      setSavedJson: mockSetSavedJson,
      setParsedData: mockSetParsedData,
    });

    const trees = [
      { id: "t1", treeData: { updated: true } },
      { id: "t2", treeData: { updated: true } },
    ];
    setTreesInStore(trees);

    expect(buildSavedJson).toHaveBeenCalledWith({
      trees: trees,
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: { "@_version": "1.0" },
    });

    expect(mockSetSavedJson).toHaveBeenCalledWith({ mocked: "json" });
  });
});
