import { useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { Sprout, Check, ChevronDown } from "lucide-react";
import NodeContextMenu from "../popups/NodeContextMenu.jsx";
import NodeAttributes from "./NodeAttributes.jsx";
import PortRemapItem from "../ui/PortRemapItem.jsx";

function SubtreeNode({ id, data }) {
  const [autoremap, setAutoremap] = useState(
    data.nodeData?.attributes?.autoremap === "true"
  );
  const [isPortsOpen, setIsPortsOpen] = useState(false);
  const [instanceName, setInstanceName] = useState(
    data?.nodeData?.attributes?.name ?? ""
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const instanceNameInputRef = useRef(null);

  useEffect(() => {
    if (isEditingName) instanceNameInputRef.current?.focus();
  }, [isEditingName]);

  useEffect(() => {
    setInstanceName(data?.nodeData?.attributes?.name ?? "");
  }, [data?.nodeData?.attributes?.name]);

  useEffect(() => {
    setAutoremap(data?.nodeData?.attributes?.autoremap === "true");
  }, [data?.nodeData?.attributes?.autoremap]);

  const handleNameDoubleClick = () => setIsEditingName(true);

  const handleNameInputBlur = () => {
    setIsEditingName(false);
    const trimmed = instanceName.trim();
    setInstanceName(trimmed);
    data.onAttributeChange?.(id, "name", trimmed);
  };

  const handleNameInputKeyDown = (event) => {
    if (event.key === "Enter") instanceNameInputRef.current?.blur();
    if (event.key === "Escape") {
      setIsEditingName(false);
      setInstanceName(data?.nodeData?.attributes?.name ?? "");
    }
  };

  if (!data?.nodeData) return null;

  const node = data.nodeData;
  const name = node.node_name;
  const displayLabel = node.subtreeId ?? name;
  const type = "NodeType.SUBTREE";

  const attributes = [
    { key: "skipIf", type: "PRE" },
    { key: "successIf", type: "PRE" },
    { key: "failureIf", type: "PRE" },
    { key: "while", type: "PRE" },
    { key: "onSuccess", type: "POST" },
    { key: "onFailure", type: "POST" },
    { key: "onHalted", type: "POST" },
    { key: "post", type: "POST" },
  ];

  const nodeAttributes = attributes.map((attr) => ({
    direction: attr.type,
    name: attr.key,
    type: attr.type,
    default: node.attributes?.[attr.key] || "",
  }));

  const ports = data.nodeData.remapped_ports ?? [];

  const readOnly = data.inSubtree === true;

  const handleAutoremapChange = (e) => {
    if (readOnly) return;

    const checked = e.target.checked;
    setAutoremap(checked);
    data.onAttributeChange?.(id, "autoremap", checked ? "true" : "");
  };

  const handleAttributeChange = (attrName, newValue) => {
    if (!data.onAttributeChange) return;
    data.onAttributeChange(id, attrName, newValue);
  };

  const canRenamePort = (newName) => {
    return !ports.map((p) => p.name).includes(newName) && newName !== "";
  };

  const handlePortChange = (oldPortName, newPortName, newValue) => {
    if (!data.onRemapPortUpdate) return;
    data.onRemapPortUpdate(id, oldPortName, newPortName, newValue);
  };

  const handlePortDelete = (portName) => {
    if (!data.onRemapPortDelete) return;
    data.onRemapPortDelete(id, portName);
  };

  const borderColor = "#89c455";

  return (
    <>
      <NodeContextMenu
        nodeId={id}
        nodeType={type}
        nodeName={name}
        data={data}
        onRename={() => setIsEditingName(true)}
      >
        <div className="behavior-tree-node text-text flex flex-col items-center bg-background border border-divider rounded-md overflow-hidden w-80">
          <div
            className="flex flex-row gap-2 pt-2 items-center justify-center cursor-default select-none"
            onDoubleClick={handleNameDoubleClick}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center border-2 shrink-0"
              style={{
                backgroundColor: `${borderColor}99`,
                borderColor: borderColor,
              }}
            >
              <Sprout className="w-4 h-4" />
            </div>

            <div className="flex flex-col items-start">
              {instanceName && !isEditingName ? (
                <>
                  <h1 className="text-md font-semibold leading-tight">
                    {instanceName}
                  </h1>
                  <span className="text-xs text-[#5C5C5C] leading-tight">
                    {displayLabel}
                  </span>
                </>
              ) : (
                <h1 className="text-md font-semibold">{displayLabel}</h1>
              )}
            </div>
          </div>

          {isEditingName && (
            <div className="px-2 pt-1 w-full flex justify-center">
              <input
                ref={instanceNameInputRef}
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                onBlur={handleNameInputBlur}
                onKeyDown={handleNameInputKeyDown}
                className="nodrag w-1/2 bg-input-field border border-divider rounded px-2 py-1 text-xs text-text placeholder-[#5C5C5C] placeholder:italic bg-transparent outline-none"
              />
            </div>
          )}

          <div className="w-full p-2">
            <div className="w-full mt-0.5 mb-2 flex items-center justify-center gap-2">
              <div className="bg-input-field border-divider border rounded-md px-4 py-1 flex items-center gap-2">
                <span className="text-xs text-muted">Auto Remap</span>
                <div
                  className="w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer shrink-0"
                  style={{
                    backgroundColor: autoremap ? "#2e2e32" : "transparent",
                    borderColor: "#5e5e60",
                  }}
                  onClick={() =>
                    handleAutoremapChange({ target: { checked: !autoremap } })
                  }
                >
                  {autoremap && (
                    <Check className="w-3 translate-y-px" strokeWidth={3} />
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-divider w-full" />
            {ports.length > 0 && (
              <div>
                <details
                  className="collapse rounded-none! pt-1"
                  open={isPortsOpen}
                  onToggle={(e) => setIsPortsOpen(e.currentTarget.open)}
                >
                  <summary className="collapse-title text-sm text-[#5C5C5C] px-0 py-2 min-h-0 flex items-center justify-between cursor-pointer">
                    <span>Port Remappings</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-input-field border border-divider rounded px-2 py-1 text-xs flex items-center justify-center min-w-6">
                        {ports.length}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isPortsOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </summary>
                  <div className="collapse-content px-0 pb-0">
                    <ul className="space-y-1 w-full mt-1">
                      {ports.map((port, i) => (
                        <li key={`port-${i}-${port.name}`}>
                          <PortRemapItem
                            port={port}
                            canRenamePort={canRenamePort}
                            handlePortChange={handlePortChange}
                            handlePortDelete={handlePortDelete}
                            readOnly={readOnly}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
                <div className="h-px bg-divider w-full my-2" />
              </div>
            )}

            {nodeAttributes.length > 0 && (
              <div>
                <NodeAttributes
                  nodeAttributes={nodeAttributes}
                  onAttributeChange={handleAttributeChange}
                  readOnly={readOnly}
                />
              </div>
            )}
          </div>
        </div>
      </NodeContextMenu>

      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
        isConnectable={!readOnly}
        style={{
          width: 15,
          height: 15,
          background: "#2e2e32",
          border: "2px solid #ffffff",
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{
          width: 15,
          height: 15,
          background: "#2e2e32",
          border: "2px solid #ffffff",
          visibility: data.expanded ? "visible" : "hidden",
        }}
      />
    </>
  );
}

export default SubtreeNode;
