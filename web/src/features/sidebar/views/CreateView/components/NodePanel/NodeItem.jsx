import { useDnD } from "../../../../../../context/DragDropContext.jsx";
import { NODE_TYPE_CONFIG } from "../../../../constants.js";
import Tooltip from "../../../../../../components/Tooltip.jsx";
import { Info } from "lucide-react";
import { useState } from "react";

/**
 * NodeItem component
 *
 * Represents a single node model in the list
 * Support drag and drop and displays node type specific styling
 * @param {Object} props
 * @param {Object} props.node - Node object with node_name, node_type, etc.
 * @param {Function} props.onClick
 * @returns {React.JSX.Element} Draggable node list item
 */
export default function NodeItem({ node, onClick }) {
  const [, setDnDInfo] = useDnD();
  const [tooltip, setTooltip] = useState(null);

  const onDragStart = (event, nodeName) => {
    setDnDInfo({ nodeName: nodeName });
    event.dataTransfer.effectAllowed = "move";
  };

  const showTooltip = (e, text, footerText) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setTooltip({
      text,
      footer_text: footerText,
      x: rect.right + 8,
      y: rect.top,
    });
  };

  const hideTooltip = () => setTooltip(null);

  const config = NODE_TYPE_CONFIG[node.node_type] || {};
  const Icon = config.icon;

  const getShortPid = (pid) => {
    if (!pid) return "";
    const parts = pid.split("::");
    return parts.length > 1 ? parts[parts.length - 1] : pid;
  };

  const shortPid = getShortPid(node.pid);

  return (
    <>
      <li
        className="flex flex-row gap-2 border items-center rounded-sm mt-1 pl-1.5 py-1 px-1.5 cursor-grab"
        onClick={onClick}
        draggable
        onDragStart={(event) => onDragStart(event, node.node_name)}
        style={{
          borderColor: config.color,
        }}
      >
        {Icon && <Icon className="flex-none w-5 h-5" />}
        <div className="flex flex-col flex-1 min-w-0">
          <span
            className="truncate text-sm font-medium leading-tight"
            title={node.node_name}
          >
            {node.node_name}
          </span>
          {node.pid && (
            <span
              className="truncate text-[10px] text-highlight leading-tight"
              title={node.pid}
            >
              {shortPid}
            </span>
          )}
        </div>

        {node.description && (
          <div
            onMouseEnter={(e) => showTooltip(e, node.description, node.pid)}
            onMouseLeave={hideTooltip}
          >
            <Info className="w-4 h-4 text-highlight cursor-help" />
          </div>
        )}
      </li>

      {tooltip && (
        <Tooltip
          text={tooltip.text}
          footer_text={tooltip.footer_text}
          position={{ x: tooltip.x, y: tooltip.y }}
        />
      )}
    </>
  );
}
