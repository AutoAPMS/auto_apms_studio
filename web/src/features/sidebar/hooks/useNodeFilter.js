import { useState, useMemo, useEffect, useRef } from "react";

/**
 * Custom hook for node filtering and sorting logic
 *
 * Manages state for:
 * - Sort type (Package/NodeType)
 * - Selected packages
 * - Search text
 *
 * @param {Array} nodes - Array of node objects
 * @returns {Object} Filter state and setters
 */
export function useNodeFilter(nodes) {
  const [sortType, setSortType] = useState("Package");
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const isInitialized = useRef(false);

  const allPackages = useMemo(
    () => [...new Set(nodes.map((node) => node.package))],
    [nodes]
  );

  useEffect(() => {
    if (!isInitialized.current && allPackages.length > 0) {
      setSelectedPackages(allPackages);
      isInitialized.current = true;
    }
  }, [allPackages]);

  return {
    sortType,
    setSortType,
    selectedPackages,
    setSelectedPackages,
    searchText,
    setSearchText,
    allPackages,
  };
}
