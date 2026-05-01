import { useState, useCallback, useEffect } from "react";

/**
 * Context menu hook
 * Handles the visibility of the context menu and the items to be displayed. On drag and outside click, as well as `ESC`
 * the context menu is hidden.
 *
 * Requires the `showContextMenu` and `hideContextMenu` functions to be called from the parent component alongside items to be displayed.
 *
 * @returns {{contextMenu: {visible: boolean, m_pos_x: number, m_pos_y: number, items: *[]}, showContextMenu: (function(*, *): void)|*, hideContextMenu: (function(): void)|*}}
 */
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    m_pos_x: 0,
    m_pos_y: 0,
    items: [],
  });

  const showContextMenu = useCallback((event, items) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      visible: true,
      m_pos_x: event.clientX,
      m_pos_y: event.clientY,
      items: items,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu({
      visible: false,
      m_pos_x: 0,
      m_pos_y: 0,
      items: [],
    });
  }, []);

  useEffect(() => {
    if (!contextMenu.visible) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        hideContextMenu();
      }
    };

    const handleMouseDown = (e) => {
      if (!e.target.closest(".context-menu")) {
        hideContextMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleMouseDown, true);
    document.addEventListener("wheel", hideContextMenu, true);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleMouseDown, true);
      document.removeEventListener("wheel", hideContextMenu, true);
    };
  }, [contextMenu, showContextMenu, hideContextMenu]);

  return { contextMenu, showContextMenu, hideContextMenu };
}
