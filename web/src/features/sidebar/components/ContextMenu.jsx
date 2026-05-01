import { useContextMenu } from "../../../hooks/useContextMenu";
import { createPortal } from "react-dom";

/**
 * @typedef {Object} MenuItem
 * @property {string} label
 * @property {string} [keybind]
 * @property {function(): any} action
 * @property {boolean} [divider]
 */
function ContextMenu({ items, children, onContextMenu }) {
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  const handleContextMenu = (e) => {
    if (items.length === 0) return;

    if (onContextMenu) {
      onContextMenu(e);
    }
    showContextMenu(e, items);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} style={{ display: "contents" }}>
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
                      {item.keybind.split(" + ").map((key, idx) => (
                        <>
                          <kbd key={idx} className="kbd kbd-sm">
                            {key}
                          </kbd>
                          {idx < item.keybind.split(" + ").length - 1 && (
                            <span>+</span>
                          )}
                        </>
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

export default ContextMenu;
