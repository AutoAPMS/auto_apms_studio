import { Handle, Position } from "@xyflow/react";
import { Cpu } from "lucide-react";

/**
 * The root node of the behavior tree.
 *
 * @returns {React.JSX.Element}: returns the node object
 * @component
 */
function RootNode() {
  const borderColor = "#2e2e32";

  return (
    <>
      <div className="behavior-tree-node text-text flex flex-col items-center bg-background border border-divider rounded-md overflow-hidden">
        <div className="w-full p-2">
          <div className="flex flex-row gap-2 items-center justify-center min-w-40">
            <div
              className="w-7 h-7 rounded flex items-center justify-center border-2"
              style={{
                backgroundColor: `${borderColor}99`,
                borderColor: borderColor,
              }}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <h1 className="text-md font-semibold">Root</h1>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 15,
          height: 15,
          background: "#2e2e32",
          border: "2px solid #ffffff",
        }}
      />
    </>
  );
}

export default RootNode;
