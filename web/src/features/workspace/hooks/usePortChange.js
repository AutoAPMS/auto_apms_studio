import { useCallback } from "react";

/**
 * usePortChange
 *
 * Handles port value changes for a specific node.
 * Updates the node's port data in ReactFlow state and triggers a tree save.
 *
 * @param {Function} setNodes - ReactFlow setNodes function
 * @param {Function} getEdges - ReactFlow getEdges function
 * @param {Function} onTreeChange - Callback to trigger tree save
 * @returns {Function} handlePortChange - (nodeId, portName, newValue) => void
 */
export default function usePortChange(setNodes, getEdges, onTreeChange) {
  return useCallback(
    (nodeId, portName, newValue) => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.map((node) => {
          if (node.id !== nodeId) return node;

          const nodeData = node.data.nodeData;
          const updatePort = (ports) =>
            ports.map((p) =>
              p.name === portName ? { ...p, default: newValue } : p
            );

          return {
            ...node,
            data: {
              ...node.data,
              nodeData: {
                ...nodeData,
                input_ports: updatePort(nodeData.input_ports ?? []),
                output_ports: updatePort(nodeData.output_ports ?? []),
                input_output_ports: updatePort(
                  nodeData.input_output_ports ?? []
                ),
              },
            },
          };
        });

        if (onTreeChange) {
          onTreeChange(updatedNodes, getEdges());
        }

        return updatedNodes;
      });
    },
    [setNodes, getEdges, onTreeChange]
  );
}
