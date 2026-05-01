import { useCallback } from "react";

/**
 * usePortRemap
 *
 * Handles subtree port changes.
 * Updates the node's port data in ReactFlow state and triggers a tree save.
 *
 * @param {Function} setNodes - ReactFlow setNodes function
 * @param {Function} getEdges - ReactFlow getEdges function
 * @param {Function} onTreeChange - Callback to trigger tree save
 * @returns {{updatePort : Function, deletePort : Function}}
 */
export default function usePortRemap(setNodes, getEdges, onTreeChange) {
  const modifyPorts = useCallback(
    (nodeId, updatePorts) => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.map((node) => {
          if (node.id !== nodeId) return node;

          const nodeData = node.data.nodeData;

          return {
            ...node,
            data: {
              ...node.data,
              nodeData: {
                ...nodeData,
                remapped_ports: updatePorts(nodeData.remapped_ports),
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

  const updatePort = useCallback(
    (nodeId, oldPortName, newPortName, newValue) => {
      const updatePorts = (ports) =>
        ports.map((p) =>
          p.name === oldPortName ? { name: newPortName, default: newValue } : p
        );
      modifyPorts(nodeId, updatePorts);
    },
    [modifyPorts]
  );

  const deletePort = useCallback(
    (nodeId, portName) => {
      const deletePorts = (ports) => ports.filter((p) => p.name !== portName);

      modifyPorts(nodeId, deletePorts);
    },
    [modifyPorts]
  );

  return { updatePort, deletePort };
}
