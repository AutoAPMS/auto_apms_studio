import { useCallback, useRef } from "react";

/**
 * Generates unique node ids based on the selected Behavior Tree.
 *
 * @param {String} selectedTreeId - The id of the selected Behavior Tree.
 *
 * @returns {{getNodeId : () => String, setNodeId : (Number) => void}}
 */
export default function useNodeIdGenerator(selectedTreeId) {
  const idRef = useRef(0);

  const getNodeId = useCallback(() => {
    const prefix = selectedTreeId ?? "n";
    return `${prefix}-${idRef.current++}`;
  }, [selectedTreeId]);

  const setNodeId = useCallback((id) => {
    idRef.current = id;
  }, []);

  return { getNodeId, setNodeId };
}
