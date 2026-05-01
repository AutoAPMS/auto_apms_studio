import { useContextMenu } from "../../../../hooks/useContextMenu";
import { createPortal } from "react-dom";
import { Trash } from "lucide-react";
import { Fragment } from "react";
import { useReactFlow } from "@xyflow/react";

function NodeContextMenu({ nodeId, children }) {
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const { setNodes } = useReactFlow();

  const handleContextMenu = (e) => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
    showContextMenu(e, getContextMenuItems());
  };

  const getContextMenuItems = () => {
    const items = [
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
    ];

    return items;
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} className="h-full w-full">
        {children}
      </div>

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
                <div key={i} className="h-px bg-divider my-1" />
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
