import { useCallback } from "react";
import { useWorkspaceStore } from "../../../store/workspaceStore.js";

/**
 * useAttributeChange
 *
 * Handles attribute value changes for a specific node.
 * Updates the node's attributes in ReactFlow state and triggers a tree save.
 * Also snapshots tmpNodes/tmpEdges for undo/redo support.
 *
 * @param {Function} setNodes - ReactFlow setNodes function
 * @param {Function} getEdges - ReactFlow getEdges function
 * @param {Function} onTreeChange - Callback to trigger tree save
 * @returns {Function} handleAttributeChange - (nodeId, attrName, newValue) => void
 */
export default function useAttributeChange(setNodes, getEdges, onTreeChange) {
  return useCallback(
    (nodeId, attrName, newValue) => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.map((node) => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...node.data,
              nodeData: {
                ...node.data.nodeData,
                attributes: {
                  ...node.data.nodeData.attributes,
                  [attrName]: newValue,
                },
              },
            },
          };
        });

        const edges = getEdges();

        useWorkspaceStore.setState({
          tmpNodes: updatedNodes,
          tmpEdges: edges,
          tmpTreeLayers: useWorkspaceStore.getState().treeLayers,
        });

        if (onTreeChange) {
          onTreeChange(updatedNodes, edges);
        }

        return updatedNodes;
      });
    },
    [setNodes, getEdges, onTreeChange]
  );
}
