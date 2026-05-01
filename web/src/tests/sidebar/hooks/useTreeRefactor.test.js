import { beforeEach, describe, it, vi, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTreeRefactor } from "../../../features/sidebar/hooks/useTreeRefactor.js";
import { setTreesInStore } from "../../../services/treeService.js";
import {
  refactorTree,
  deleteSubtreesInWorkspace,
} from "../../../features/sidebar/utils/treeRefactorUtils.js";

const { storeState, setNodes, snapshotForUndo } = vi.hoisted(() => {
  return {
    storeState: {
      setSelectedTree: vi.fn(),
      trees: [],
      selectedTreeId: "1",
      savedJson: null,
      rootAttrs: {},
      xmlDeclaration: null,
    },
    setNodes: vi.fn(),
    snapshotForUndo: vi.fn(),
  };
});

vi.mock("../../../store/treeStore.js", () => ({
  useStore: Object.assign(
    vi.fn().mockImplementation((fn) => fn(storeState)),
    {
      getState: vi.fn(() => ({
        savedJson: storeState.savedJson,
        rootAttrs: storeState.rootAttrs,
        xmlDeclaration: storeState.xmlDeclaration,
      })),
    }
  ),
}));

vi.mock("../../../store/workspaceStore.js", () => ({
  useWorkspaceStore: {
    getState: vi.fn(() => ({
      snapshotForUndo,
      nodes: [],
      edges: [],
      treeLayers: [500],
    })),
  },
}));

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    setNodes: setNodes,
    setEdges: vi.fn(),
  })),
}));

vi.mock("../../../services/treeService.js", () => ({
  setTreesInStore: vi.fn(),
}));

vi.mock("../../../features/sidebar/utils/treeRefactorUtils.js", () => ({
  deleteSubtreesInWorkspace: vi.fn(),
  refactorTree: vi.fn(),
  renameSubtreesInWorkspace: vi.fn(),
}));

describe("useTreeRefactor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("renameTree", () => {
    it("should set selected tree to new id when it is renamed", () => {
      storeState.trees = [{ id: "1", treeData: "Test" }, { id: "2" }];
      storeState.selectedTreeId = "1";
      refactorTree.mockImplementation((t) => ({ tree: t }));

      const { result } = renderHook(() => useTreeRefactor());

      act(() => {
        result.current.renameTree("1", "3");
      });

      const expectedTrees = [{ id: "3", treeData: "Test" }, { id: "2" }];

      expect(setTreesInStore).toHaveBeenCalledWith(expectedTrees);
      expect(storeState.setSelectedTree).toHaveBeenCalledWith("Test", "3");
    });

    it("should rename nodes in workspace if a subtree is renamed", () => {
      storeState.trees = [{ id: "1", treeData: "Test" }, { id: "2" }];
      storeState.selectedTreeId = "1";
      refactorTree.mockImplementation((t) => ({ tree: t }));

      const { result } = renderHook(() => useTreeRefactor());

      act(() => {
        result.current.renameTree("2", "3");
      });

      const expectedTrees = [{ id: "1", treeData: "Test" }, { id: "3" }];

      expect(setTreesInStore).toHaveBeenCalledWith(expectedTrees);
      expect(setNodes).toHaveBeenCalled();
    });
  });

  describe("deleteTree", () => {
    it("should set selected tree to null when it is deleted", () => {
      storeState.trees = [{ id: "1", treeData: "Test" }, { id: "2" }];
      storeState.selectedTreeId = "1";
      refactorTree.mockImplementation((t) => ({ tree: t }));

      const { result } = renderHook(() => useTreeRefactor());

      act(() => {
        result.current.deleteTree("1", false);
      });

      const expectedTrees = [{ id: "2" }];

      expect(snapshotForUndo).toHaveBeenCalled();
      expect(refactorTree).not.toHaveBeenCalled();
      expect(setTreesInStore).toHaveBeenCalledWith(expectedTrees);
      expect(storeState.setSelectedTree).toHaveBeenCalledWith(null, null);
    });

    it("should delete nodes in workspace if a subtree is deleted", () => {
      storeState.trees = [{ id: "1", treeData: "Test" }, { id: "2" }];
      storeState.selectedTreeId = "1";
      refactorTree.mockImplementation((t) => ({ tree: t }));
      deleteSubtreesInWorkspace.mockReturnValue({ nodes: [], edges: [] });

      const { result } = renderHook(() => useTreeRefactor());

      act(() => {
        result.current.deleteTree("2", true);
      });

      const expectedTrees = [{ id: "1", treeData: "Test" }];

      expect(snapshotForUndo).toHaveBeenCalled();
      expect(refactorTree).toHaveBeenCalled();
      expect(setTreesInStore).toHaveBeenCalledWith(expectedTrees);
      expect(setNodes).toHaveBeenCalled();
    });
  });
});
