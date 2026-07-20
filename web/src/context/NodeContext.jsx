import { createContext, useContext, useMemo, useState } from "react";
import { useFetchNodes } from "../features/sidebar/hooks/useFetchNodes.js";

/**
 * Context for accessing node manifest with a default value of null
 * @type {React.Context<*[]>}
 */

const NodeContext = createContext([]);

/**
 * Provider for sharing the node data and a function to get the node data for a specific node name between every
 * component (child) rendered inside the provider
 *
 * @param children - components rendered inside the provider
 * @returns {React.JSX.Element}
 * @component
 */

export const NodeProvider = ({ children }) => {
  const {
    nodes,
    error: fetchError,
    clearError: clearFetchError,
    status,
  } = useFetchNodes();
  const [manualError, setManualError] = useState(null);

  const error = manualError || fetchError;

  const clearError = () => {
    setManualError(null);
    clearFetchError();
  };

  // Augment each model with a stable, unique reference key.
  // Plugin nodes (non-empty metadata_id): "<package>::<metadata_id>.<node_name>"
  // Native nodes (empty metadata_id):    "<node_name>"  (always globally unique in BT.CPP)
  const nodeData = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        nodeUniqueReference:
          n.pid && n.metadata_id ? `${n.pid}.${n.node_name}` : n.node_name,
      })),
    [nodes]
  );

  // Unambiguous lookup by nodeUniqueReference.
  const getNodeDataByRef = (ref) => {
    if (!ref) return undefined;
    return nodeData.find((n) => n.nodeUniqueReference === ref);
  };

  return (
    <NodeContext.Provider
      value={{
        nodeData,
        getNodeDataByRef,
        error,
        clearError,
        setError: setManualError,
        status,
      }}
    >
      {children}
    </NodeContext.Provider>
  );
};

/**
 * Hook for components to access the NodeContext
 *
 * @returns {*[]}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNodeContext = () => {
  return useContext(NodeContext);
};
