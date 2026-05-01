import { useCallback } from "react";
import { flowToTreeData } from "../../../services/flowToTreeConverter.js";
import { updateTreeInStore } from "../../../services/treeService.js";
import { useStore } from "../../../store/treeStore.js";

/**
 * useTreeChange
 *
 * Handles saving ReactFlow node/edge changes back to the store.
 * Uses selectedTreeId for reliable tree lookup without reference comparison.
 * Falls back to auto-selecting the single available tree if none is selected.
 */
export default function useTreeChange(trees) {
  const selectedTreeId = useStore((state) => state.selectedTreeId);
  const setSelectedTree = useStore((state) => state.setSelectedTree);

  return useCallback(
    (currentNodes, currentEdges) => {
      let activeId = selectedTreeId;

      if (!activeId && Array.isArray(trees) && trees.length === 1) {
        activeId = trees[0].id;
        setSelectedTree(trees[0].treeData, activeId);
      }

      if (!activeId) return;

      const activeTree = trees.find((t) => t.id === activeId);
      if (!activeTree) {
        console.warn("Could not find active tree in store:", activeId);
        return;
      }

      const updatedTreeData = flowToTreeData(currentNodes, currentEdges);
      const updatedTree = { id: activeId, treeData: updatedTreeData };

      updateTreeInStore(activeId, updatedTree);
    },
    [selectedTreeId, setSelectedTree, trees]
  );
}
