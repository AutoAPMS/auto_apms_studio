import { Package } from "lucide-react";
import NodeItem from "../views/CreateView/components/NodePanel/NodeItem.jsx";

function ExpandableList({ parentItems, nodes, sortType }) {
  return (
    <>
      {parentItems.map((parentName) => (
        <li
          key={parentName}
          className="collapse border border-divider mb-1 mt-1 rounded-sm hover:border-highlight"
        >
          <input type="checkbox" />
          <div className="collapse-title items-center text-sm font-small py-1 flex flex-row gap-1 pl-2 ">
            <Package className="flex-none w-5 h-5" />
            {parentName}
          </div>

          <div className="collapse-content">
            <ul className="list-none">
              {nodes
                .filter((node) => node[sortType] === parentName)
                .map((node) => (
                  <NodeItem
                    key={`${node.package}-${node.metadata_id}-${node.node_name}`}
                    node={node}
                  />
                ))}
            </ul>
          </div>
        </li>
      ))}
    </>
  );
}

export default ExpandableList;
