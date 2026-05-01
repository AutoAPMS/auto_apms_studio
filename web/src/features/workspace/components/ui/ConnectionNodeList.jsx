import { useNodeContext } from "../../../../context/NodeContext.jsx";
import { useEffect, useState, useMemo } from "react";
import { filterBySearch } from "../../../sidebar/utils/searchUtils.js";
import SearchInput from "../../../sidebar/components/SearchInput.jsx";
import NodeItem from "../../../sidebar/views/CreateView/components/NodePanel/NodeItem.jsx";
import { createPortal } from "react-dom";

/**
 * Floating node list that appears at the position where an invalid connection is dropped.
 * Allows the user to search and select a node that is then displayed in the workspace.
 *
 * @param nodeList When null, component renders nothing, if not it provides parent and position data
 * @param closeNodeList Callback to close menu
 * @param onSelect Called when user selects a node type
 * @returns {React.JSX.Element} Node list in workspace
 * @constructor
 */

function ConnectionNodeList({ nodeList, closeNodeList, onSelect }) {
  const { nodeData: nodes } = useNodeContext();
  const [searchText, setSearchText] = useState("");

  const searchedNodes = useMemo(() => {
    if (searchText.length > 0) {
      return filterBySearch(nodes, searchText, "node_name");
    }
    return nodes;
  }, [nodes, searchText]);

  useEffect(() => {
    if (!nodeList) {
      setSearchText("");
    }
  }, [nodeList]);

  return nodeList
    ? createPortal(
        <div
          style={{ top: nodeList.y - 20, left: nodeList.x - 20 }}
          className="connection-node-list fixed z-10 w-60 h-60 flex flex-col bg-background border border-divider rounded-md p-2"
        >
          <SearchInput onChange={setSearchText} autoFocus />
          <ul
            key={`search-list-${searchText.length > 0 ? "search" : "normal"}`}
            className="flex-1 border border-divider rounded-md text-text p-2 overflow-y-auto overflow-x-hidden"
          >
            {searchedNodes.map((node) => (
              <NodeItem
                onClick={() => {
                  onSelect(
                    node.node_name,
                    { x: nodeList.x, y: nodeList.y },
                    nodeList.parent
                  );
                  closeNodeList();
                  setSearchText("");
                }}
                key={`${node.package}-${node.node_name}`}
                node={node}
              />
            ))}
          </ul>
        </div>,
        document.body
      )
    : null;
}

export default ConnectionNodeList;
