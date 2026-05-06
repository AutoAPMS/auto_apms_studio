import { createContext, useContext, useState } from "react";
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
  const nodeData = nodes;

  const error = manualError || fetchError;

  const clearError = () => {
    setManualError(null);
    clearFetchError();
  };

  const getNodeDataByName = (nodeName) => {
    return nodeData.find((node) => node.node_name === nodeName);
  };

  return (
    <NodeContext.Provider
      value={{
        nodeData,
        getNodeDataByName,
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
