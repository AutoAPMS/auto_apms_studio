import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useStore } from "../../../store/treeStore.js";
import { useWorkspaceStore } from "../../../store/workspaceStore.js";
import { setTreesInStore } from "../../../services/treeService.js";
import {
  deleteSubtreesInWorkspace,
  refactorTree,
  renameSubtreesInWorkspace,
} from "../utils/treeRefactorUtils.js";
import { useNodeContext } from "../../../context/NodeContext.jsx";

/**
 * Hook for renaming and deleting behavior trees.
 *
 * @returns {{renameTree: (function(String, String): void), deleteTree: (function(String, Boolean): void)}}
 */
export function useTreeRefactor() {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();
  const { nodeData, setError } = useNodeContext();
  const setSelectedTree = useStore((state) => state.setSelectedTree);
  const trees = useStore((state) => state.trees);
  const selectedTreeId = useStore((state) => state.selectedTreeId);

  const renameTree = useCallback(
    (oldTreeId, newTreeId) => {
      const hasConflict =
        getNodes().some((n) => {
          const d = n.data || {};
          return (
            n.id === newTreeId ||
            d.subtreeId === newTreeId ||
            d.subtree === newTreeId ||
            d.treeId === newTreeId
          );
        }) ||
        (Array.isArray(nodeData) &&
          nodeData.some((model) => model.node_name === newTreeId));

      if (hasConflict) {
        setError(
          "Behavior Tree name already in use. Please choose another name."
        );
        return;
      }

      const updatedTrees = trees.map((t) =>
        t.id === oldTreeId
          ? { ...t, id: newTreeId }
          : refactorTree(t, oldTreeId, newTreeId).tree
      );

      setTreesInStore(updatedTrees);

      if (selectedTreeId === oldTreeId) {
        const treeData = updatedTrees.find((t) => t.id === newTreeId).treeData;
        setSelectedTree(treeData, newTreeId);
      } else {
        setNodes((nodes) =>
          renameSubtreesInWorkspace(nodes, oldTreeId, newTreeId)
        );
      }
    },
    [selectedTreeId, setNodes, setSelectedTree, trees, getNodes, nodeData]
  );

  const deleteTree = useCallback(
    (treeId, shouldRefactor) => {
      const { savedJson, rootAttrs, xmlDeclaration } = useStore.getState();
      useWorkspaceStore.getState().snapshotForUndo({
        trees,
        savedJson,
        rootAttrs,
        xmlDeclaration,
      });

      const updatedTrees = trees
        .filter((t) => t.id !== treeId)
        .map((t) => (shouldRefactor ? refactorTree(t, treeId).tree : t));

      setTreesInStore(updatedTrees);

      if (selectedTreeId === treeId) {
        setSelectedTree(null, null);
        setNodes([]);
        setEdges([]);
      } else if (shouldRefactor) {
        const { nodes, edges } = deleteSubtreesInWorkspace(
          getNodes(),
          getEdges(),
          treeId
        );
        setNodes(nodes);
        setEdges(edges);
      }
    },
    [
      getEdges,
      getNodes,
      selectedTreeId,
      setEdges,
      setNodes,
      setSelectedTree,
      trees,
    ]
  );

  return { renameTree, deleteTree };
}
