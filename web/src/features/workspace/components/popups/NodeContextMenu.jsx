import { useContextMenu } from "../../../../hooks/useContextMenu";
import { createPortal } from "react-dom";
import { Fragment } from "react";
import { useReactFlow } from "@xyflow/react";
import { useStore } from "../../../../store/treeStore.js";

function NodeContextMenu({ nodeId, nodeType, data, children, onRename }) {
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const { setNodes, deleteElements, getEdges } = useReactFlow();

  const handleContextMenu = (e) => {
    if (data.inSubtree === true) return;
    setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
    showContextMenu(e, getContextMenuItems());
  };

  const hasChildren = () => {
    const edges = getEdges();
    return edges.some((edge) => edge.source === nodeId);
  };

  const handleCreateTree = () => {
    const { trees } = useStore.getState();
    let num = 1;
    let treeIds = trees.map((t) => t.id);
    let treeId;
    do {
      treeId = `NewTree${num++}`;
    } while (treeIds.includes(treeId));
    data.onCreateSubtree?.(nodeId, treeId);
  };

  const remapPort = () => {
    const ports = data?.nodeData?.remapped_ports?.map((p) => p.name) ?? [];
    let num = 1;
    let portName;
    do {
      portName = `Port${num++}`;
    } while (ports.includes(portName));

    const newPort = { name: portName, default: "" };

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n;

        return {
          ...n,
          data: {
            ...n.data,
            nodeData: {
              ...n.data.nodeData,
              remapped_ports: n.data?.nodeData?.remapped_ports?.concat(
                newPort
              ) ?? [newPort],
            },
          },
        };
      })
    );
  };

  const getContextMenuItems = () => {
    const items = [
      {
        label: "Rename",
        action: () => onRename?.(),
      },
      { divider: true },
      {
        label: "Copy",
        keybind: "CTRL + C",
        action: () => {
          const event = new KeyboardEvent("keydown", {
            key: "c",
            ctrlKey: true,
          });
          document.dispatchEvent(event);
        },
      },
      {
        label: "Paste",
        keybind: "CTRL + V",
        action: () => {
          const event = new KeyboardEvent("keydown", {
            key: "v",
            ctrlKey: true,
          });
          document.dispatchEvent(event);
        },
      },
      {
        label: "Delete Node",
        keybind: "DELETE",
        action: () => {
          void deleteElements({ nodes: [{ id: nodeId }] });
        },
      },
    ];

    if (
      !data.inSubtree &&
      nodeType !== "NodeType.SUBTREE" &&
      data.onHasChildren(nodeId)
    ) {
      items.push(
        { divider: true },
        {
          label: "Create Subtree",
          action: () => {
            handleCreateTree();
          },
        }
      );
    }

    if (nodeType === "NodeType.SUBTREE" && data.expanded && hasChildren()) {
      items.push(
        { divider: true },
        {
          label: "Collapse Subtree",
          action: () => {
            data.onToggleSubtree?.(nodeId);
          },
        }
      );
    } else if (
      nodeType === "NodeType.SUBTREE" &&
      !data.expanded &&
      hasChildren()
    ) {
      items.push(
        { divider: true },
        {
          label: "Open Subtree",
          action: () => {
            data.onToggleSubtree?.(nodeId);
          },
        }
      );
    }

    if (nodeType === "NodeType.SUBTREE") {
      items.push({
        label: "Remap Port",
        action: () => {
          remapPort();
        },
      });
    }

    return items;
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>

      {contextMenu.visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${contextMenu.m_pos_y}px`,
              left: `${contextMenu.m_pos_x}px`,
              zIndex: 9999,
            }}
            className="context-menu flex flex-col bg-background border border-divider rounded-md min-w-60 overflow-hidden"
          >
            {contextMenu.items.map((item, i) =>
              item.divider ? (
                <div key={i} className="h-px bg-divider" />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.action();
                    hideContextMenu();
                  }}
                  className="px-2 py-2 text-left text-text hover:bg-highlight transition-colors text-sm flex items-center justify-between gap-4 cursor-pointer"
                >
                  {item.label}
                  {item.keybind && (
                    <div className="flex items-center gap-1 text-text">
                      {item.keybind.split(" + ").map((key, i) => (
                        <Fragment key={i}>
                          <kbd className="kbd kbd-sm">{key}</kbd>
                          {i < item.keybind.split(" + ").length - 1 && (
                            <span>+</span>
                          )}
                        </Fragment>
                      ))}
                    </div>
                  )}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default NodeContextMenu;
