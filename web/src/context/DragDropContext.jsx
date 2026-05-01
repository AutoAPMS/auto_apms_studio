import { useState, createContext, useContext } from "react";

/**
 * Context for sharing DnD related props
 * Default value null and an empty function for components using the context and not being in the provider
 *
 * @type {React.Context<((function())|*)[]>}
 */
const DragDropContext = createContext([null, () => {}]);

/**
 * Provider sharing the useState for the node information globally between every component rendered inside the provider
 *
 * @param children - components in the provider having access to the shared useState
 * @returns {React.JSX.Element}
 * @component
 */
export const DnDProvider = ({ children }) => {
  const [dnDInfo, setDnDInfo] = useState(null);

  return (
    <DragDropContext.Provider value={[dnDInfo, setDnDInfo]}>
      {children}
    </DragDropContext.Provider>
  );
};

/**
 * Hook for components to access the context
 *
 * @returns {((function())|*)[]}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useDnD = () => {
  return useContext(DragDropContext);
};
