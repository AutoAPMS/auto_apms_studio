import { create } from "zustand";
import { temporal } from "zundo";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

/**
 * Zustand store for managing the workspace state.
 * Uses temporal undo for efficient undo/redo.
 */
export const useWorkspaceStore = create(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      treeLayers: [500],

      tmpNodes: [],
      tmpEdges: [],
      tmpTreeLayers: [],
      tmpTrees: null,
      tmpSavedJson: null,
      tmpRootAttrs: null,
      tmpXmlDeclaration: null,

      setNodes: (nodes) => {
        if (typeof nodes === "function") {
          set((state) => ({ nodes: nodes(state.nodes) }));
        } else {
          set({ nodes });
        }
      },

      setEdges: (edges) => {
        if (typeof edges === "function") {
          set((state) => ({ edges: edges(state.edges) }));
        } else {
          set({ edges });
        }
      },

      setTreeLayers: (layers) => {
        if (typeof layers === "function") {
          set((state) => ({ treeLayers: layers(state.treeLayers) }));
        } else {
          set({ treeLayers: layers });
        }
      },

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      snapshotForUndo: ({ trees, savedJson, rootAttrs, xmlDeclaration }) => {
        const state = get();
        set({
          tmpNodes: state.nodes,
          tmpEdges: state.edges,
          tmpTreeLayers: state.treeLayers,
          tmpTrees: trees,
          tmpSavedJson: savedJson,
          tmpRootAttrs: rootAttrs,
          tmpXmlDeclaration: xmlDeclaration,
        });
      },
    }),
    {
      limit: 10,
      partialize: (state) => ({
        tmpNodes: state.tmpNodes,
        tmpEdges: state.tmpEdges,
        tmpTreeLayers: state.tmpTreeLayers,
        tmpTrees: state.tmpTrees,
        tmpSavedJson: state.tmpSavedJson,
        tmpRootAttrs: state.tmpRootAttrs,
        tmpXmlDeclaration: state.tmpXmlDeclaration,
      }),
      equality: (prev, curr) => {
        if (
          prev.tmpNodes.length !== curr.tmpNodes.length ||
          prev.tmpEdges.length !== curr.tmpEdges.length
        )
          return false;

        if (prev.tmpSavedJson !== curr.tmpSavedJson) return false;

        const nodesEqual = prev.tmpNodes.every((n, i) => {
          const c = curr.tmpNodes[i];
          const { layer: __, ...prevData } = n.data ?? {};
          const { layer: _, ...currData } = c.data ?? {};

          return (
            c &&
            n.id === c.id &&
            n.type === c.type &&
            n.parentId === c.parentId &&
            JSON.stringify(prevData) === JSON.stringify(currData)
          );
        });

        const edgesEqual = prev.tmpEdges.every((e, i) => {
          const c = curr.tmpEdges[i];
          return (
            c && e.id === c.id && e.source === c.source && e.target === c.target
          );
        });

        return nodesEqual && edgesEqual;
      },
    }
  )
);
