import ExpandableList from "../../../../components/ExpandableList.jsx";
import NodeItem from "./NodeItem.jsx";
import { filterBySearch } from "../../../../utils/searchUtils.js";

/**
 * NodeList component
 *
 * Provides a scrollable list of node names. The default list is with the
 * sortType set to Package. Depending on their node type the node names are bordered by a designated color.
 *
 * @param nodes the array of all node objects
 * @param sortType if "Package" or "NodeType" it is an expandable list sorted accordingly
 * @param selectedPackages determines which packages will be shown in the list
 * @param searchText if not empty, a simple list with matching node names is displayed
 * @returns {React.JSX.Element} A scrollable list sorted in an expandable list by sortType or
 *                              a simple list of node names that match the searchText
 */
export default function NodeList({
  nodes,
  sortType,
  selectedPackages,
  searchText,
}) {
  const type = sortType === "NodeType" ? "node_type" : "package";

  return (
    <ul
      key={`list-${searchText.length > 0 ? "search" : "normal"}`}
      className="h-full border border-divider rounded-md text-text p-2 overflow-y-auto overflow-x-hidden"
    >
      {searchText.length > 0 ? (
        filterBySearch(nodes, searchText, "node_name").map((node) => (
          <NodeItem key={`${node.package}-${node.node_name}`} node={node} />
        ))
      ) : (
        <ExpandableList
          key={`expandable-${type}`}
          parentItems={[
            ...new Set(
              nodes
                .map((node) => node[type])
                .filter((name) =>
                  type === "package" ? selectedPackages.includes(name) : true
                )
            ),
          ]}
          nodes={nodes}
          sortType={type}
        />
      )}
    </ul>
  );
}
