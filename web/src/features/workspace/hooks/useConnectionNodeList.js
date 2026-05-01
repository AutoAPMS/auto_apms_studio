import { useState, useCallback, useEffect } from "react";

/**
 *Custom hook that manages state for the Component ConnectionNodeList, that appears
 * when an invalid connection is dropped
 * @returns {Function} on ConnectEnd opens node list when a connection is dropped
 * @returns {Function} closeNodeList- closes the menu
 * @returns {Object} null if the menu is closed, position and parent node if opened
 */

function useConnectionNodeList() {
  const [nodeList, setNodeList] = useState(null);
  const closeNodeList = useCallback(() => setNodeList(null), []);

  const onConnectEnd = useCallback((event, connectionState) => {
    if (!connectionState.isValid) {
      setTimeout(() => {
        setNodeList({
          x: event.clientX,
          y: event.clientY,
          parent: connectionState.fromNode,
        });
      }, 10);
    }
  }, []);

  useEffect(() => {
    if (!nodeList) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeNodeList();
      }
    };

    const handleMouseDown = (e) => {
      if (!e.target.closest(".connection-node-list")) {
        closeNodeList();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleMouseDown, true);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleMouseDown, true);
    };
  }, [nodeList, closeNodeList]);

  return { nodeList, onConnectEnd, closeNodeList };
}

export { useConnectionNodeList };
