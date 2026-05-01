import { Settings } from "lucide-react";
import { useState } from "react";
import TreeList from "./TreeList.jsx";
import SectionHeader from "../../../../components/SectionHeader.jsx";
import SearchInput from "../../../../components/SearchInput.jsx";
import { SIDEBAR_COLORS } from "../../../../constants.js";
import { createTreeAndUpdateStore } from "../../../../../../services/treeService.js";
import { useStore } from "../../../../../../store/treeStore.js";
import { EMPTY_TREE_TEMPLATE_Json } from "../../../../constants";

/**
 * TreeManager component
 *
 * Manages Behavior Tree list with search functionality
 *
 * @returns {React.JSX.Element} Tree list with header and search
 */
export default function TreePanel({ showHeader = true }) {
  const [searchText, setSearchText] = useState("");
  const treesColor = SIDEBAR_COLORS.BEHAVIOR_TREES;

  const handleCreateTree = () => {
    const { trees, setSelectedTree } = useStore.getState();
    let num = 1;
    let treeIds = trees.map((t) => t.id);
    let treeId;
    do {
      treeId = `NewTree${num++}`;
    } while (treeIds.includes(treeId));

    const treeData = EMPTY_TREE_TEMPLATE_Json.treeData;
    createTreeAndUpdateStore(treeId, treeData);
    setSelectedTree(treeData, treeId);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {showHeader && (
        <SectionHeader
          icon={Settings}
          title="BEHAVIOR TREES"
          color={treesColor}
          onActionClick={handleCreateTree}
        />
      )}
      <SearchInput onChange={setSearchText} />
      <TreeList searchText={searchText} />
    </div>
  );
}
