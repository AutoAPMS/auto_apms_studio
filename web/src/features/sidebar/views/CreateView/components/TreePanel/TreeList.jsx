import React, { useCallback, useRef, useState } from "react";
import { useStore } from "../../../../../../store/treeStore.js";
import TreeItem from "./TreeItem.jsx";
import { parseSavedJson } from "../../../../../../services/jsonService.js";
import { filterBySearch } from "../../../../utils/searchUtils.js";
import TreeDeleteMenu from "./TreeDeleteMenu.jsx";
import { checkCircularDependencies } from "../../../../../../utils/treeDependencyUtils.js";
/**
 * TreeList component
 */
export default function TreeList({ searchText }) {
  const savedJson = useStore((state) => state.savedJson);
  const setParsedData = useStore((state) => state.setParsedData);
  const setEntryTreeId = useStore((state) => state.setEntryTreeId);
  const setSelectedTree = useStore((state) => state.setSelectedTree);
  const selectedTreeId = useStore((state) => state.selectedTreeId);
  const [deleteTreeId, setDeleteTreeId] = useState("");
  const deleteMenuRef = useRef(null);
  const initializedRef = useRef(false);

  const parsed = React.useMemo(() => {
    if (!savedJson) return null;
    return parseSavedJson(savedJson);
  }, [savedJson]);

  React.useEffect(() => {
    if (!parsed) return;
    setParsedData(parsed);

    if (!initializedRef.current) {
      initializedRef.current = true;

      if (parsed.entryTreeId !== null) {
        setEntryTreeId(parsed.entryTreeId);
        const defaultTree = parsed.trees?.find(
          (t) => t.id === parsed.entryTreeId
        );
        if (defaultTree) {
          setSelectedTree(defaultTree.treeData, defaultTree.id);
        }
      } else {
        setSelectedTree(null, null);
      }
    }
  }, [parsed, setEntryTreeId, setParsedData, setSelectedTree]);

  const treeList = React.useMemo(() => {
    if (!parsed?.trees?.length) return [];
    if (searchText.length > 0) {
      return filterBySearch(parsed.trees, searchText, "id");
    }
    return parsed.trees;
  }, [parsed, searchText]);

  const showDeleteMenu = useCallback((treeId) => {
    deleteMenuRef.current?.showModal();
    setDeleteTreeId(treeId);
  }, []);

  const treeCycles = React.useMemo(() => {
    const trees = parsed?.trees ?? [];
    return checkCircularDependencies(trees, trees, [selectedTreeId]);
  }, [parsed, selectedTreeId]);

  return (
    <>
      <ul
        key={`tree-list-${searchText.length > 0 ? "search" : "normal"}`}
        className="h-full overflow-y-auto border border-divider rounded-md text-text p-2"
      >
        {treeList.map((tree) => (
          <TreeItem
            key={tree.id}
            tree={tree}
            rootAttrs={parsed.rootAttrs}
            xmlDeclaration={parsed.xmlDeclaration}
            showDeleteMenu={showDeleteMenu}
            hasCycle={treeCycles.get(tree.id)}
          />
        ))}
      </ul>
      <TreeDeleteMenu ref={deleteMenuRef} treeId={deleteTreeId} />
    </>
  );
}
