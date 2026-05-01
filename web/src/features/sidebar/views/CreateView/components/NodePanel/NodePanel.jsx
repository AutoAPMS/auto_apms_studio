import { useState } from "react";
import { Box, ArrowDownUp } from "lucide-react";
import NodeFilter from "./NodeFilter.jsx";
import NodeList from "./NodeList.jsx";
import { useNodeContext } from "../../../../../../context/NodeContext.jsx";
import { useNodeFilter } from "../../../../hooks/useNodeFilter.js";
import SectionHeader from "../../../../components/SectionHeader.jsx";
import SearchInput from "../../../../components/SearchInput.jsx";
import { SIDEBAR_COLORS } from "../../../../constants.js";

/**
 * NodeManager component
 *
 * Manager component that consumes node data from NodeContext
 * and manages state for sorting, searching and package selection via useNodeFilter.
 * Provides NodeFilter and NodeList component.
 *
 * @returns {React.JSX.Element} complete node list with filter and search functionality
 */
export default function NodePanel() {
  const { nodeData: nodes } = useNodeContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const nodesColor = SIDEBAR_COLORS.NODE_MODELS;

  const {
    sortType,
    setSortType,
    selectedPackages,
    setSelectedPackages,
    searchText,
    setSearchText,
  } = useNodeFilter(nodes);

  return (
    <div className="h-full flex flex-col relative">
      <SectionHeader
        icon={Box}
        title="NODE MODELS"
        color={nodesColor}
        onActionClick={() => setIsFilterOpen(!isFilterOpen)}
        actionIcon={ArrowDownUp}
      />

      <NodeFilter
        nodes={nodes}
        setSortType={setSortType}
        sortType={sortType}
        setSelectedPackages={setSelectedPackages}
        selectedPackages={selectedPackages}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
      />

      <SearchInput onChange={setSearchText} />

      <NodeList
        nodes={nodes}
        sortType={sortType}
        selectedPackages={selectedPackages}
        searchText={searchText}
      />
    </div>
  );
}
