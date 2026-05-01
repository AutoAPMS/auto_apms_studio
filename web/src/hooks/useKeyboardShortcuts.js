import { useEffect } from "react";
import { useWorkspaceStore } from "../store/workspaceStore.js";
import { useStore } from "../store/treeStore.js";

export function useKeyboardShortcuts(onTreeChange) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const isUndo = e.key === "z";
      const isRedo = e.key === "y";
      if (!isUndo && !isRedo) return;

      e.preventDefault();
      const { undo, redo, pastStates, futureStates } =
        useWorkspaceStore.temporal.getState();

      let undoOrRedoUsed = false;

      if (isUndo && pastStates.length > 0) {
        undo();
        undoOrRedoUsed = true;
      } else if (isRedo && futureStates.length > 0) {
        redo();
        undoOrRedoUsed = true;
      }

      if (undoOrRedoUsed) {
        const {
          tmpNodes: n,
          tmpEdges: e,
          tmpTreeLayers: t,
          tmpTrees: trees,
          tmpSavedJson: savedJson,
          tmpRootAttrs: rootAttrs,
          tmpXmlDeclaration: xmlDeclaration,
        } = useWorkspaceStore.getState();

        useWorkspaceStore.setState({
          nodes: n,
          edges: e,
          treeLayers: t,
        });

        if (savedJson !== null && trees !== null) {
          const { setSavedJson, setParsedData } = useStore.getState();
          setParsedData({ trees, rootAttrs, xmlDeclaration });
          setSavedJson(savedJson);
        }

        if (onTreeChange) {
          onTreeChange(n, e);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTreeChange]);
}
