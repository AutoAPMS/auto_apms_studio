import { useEffect } from "react";
import { useStore } from "../../../store/treeStore.js";

export function useWorkspaceRehydration(modalRef) {
  const trees = useStore((s) => s.trees);
  const selectedTreeId = useStore((s) => s.selectedTreeId);
  const setSelectedTree = useStore((s) => s.setSelectedTree);

  useEffect(() => {
    if (Array.isArray(trees) && trees.length > 0) {
      const match = selectedTreeId
        ? (trees.find((t) => t.id === selectedTreeId) ?? trees[0])
        : trees[0];

      if (match) setSelectedTree(match.treeData, match.id);
      modalRef.current?.close?.();
    } else {
      modalRef.current?.showModal?.();
    }
  }, [modalRef, selectedTreeId, setSelectedTree, trees]);
}
