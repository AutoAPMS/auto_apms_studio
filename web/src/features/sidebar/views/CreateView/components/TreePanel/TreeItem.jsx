import { useStore } from "../../../../../../store/treeStore.js";
import { Network, BookmarkCheck } from "lucide-react";
import TreeItemContextMenu from "./TreeItemContextMenu.jsx";
import { useState } from "react";
import { useTreeRefactor } from "../../../../hooks/useTreeRefactor.js";
import { useDnD } from "../../../../../../context/DragDropContext.jsx";

/**
 * TreeItem component
 *
 * Represents a single behavior tree in the list.
 * Clickable to select the tree and wrapped with a context menu.
 *
 * @param {Object} props
 * @param {Object} props.tree - Tree object containing id, raw data and metadata.
 * @param {Object|null} props.rootAttrs - Root XML attributes used for export.
 * @param {Object|null} props.xmlDeclaration - XML declaration metadata used for export.
 * @param {(String) => void} props.showDeleteMenu - Function to show the delete popup.
 * @param {Boolean} props.hasCycle - True if the tree has a circular dependency.
 *
 * @returns {React.JSX.Element} Clickable tree list item with context menu support.
 */
export default function TreeItem({
  tree,
  rootAttrs,
  xmlDeclaration,
  showDeleteMenu,
  hasCycle,
}) {
  const setSelectedTree = useStore((state) => state.setSelectedTree);
  const selectedTreeId = useStore((state) => state.selectedTreeId);
  const entryTreeId = useStore((state) => state.entryTreeId);
  const trees = useStore((state) => state.trees);
  const setEntryTreeId = useStore((state) => state.setEntryTreeId);
  const [isRenamingTree, setIsRenamingTree] = useState(false);
  const { renameTree } = useTreeRefactor();
  const [, setDnDInfo] = useDnD();

  const isSelected = selectedTreeId === tree.id;
  const isEntryTree = entryTreeId === tree.id;

  const handleClick = () => {
    setSelectedTree(tree.treeData, tree.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTreeName = new FormData(e.target).get("treeName");
    const treeIds = trees.map((tree) => tree.id);
    if (!treeIds.includes(newTreeName) && newTreeName.length > 0) {
      renameTree(tree.id, newTreeName);
      setIsRenamingTree(false);
    }
  };

  const onDragStart = (event) => {
    setDnDInfo({ subtreeId: tree.id });
    event.dataTransfer.effectAllowed = "move";
  };

  const handleTreeItemDoubleClick = () => {
    setEntryTreeId(tree.id);
  };

  const draggable = !hasCycle && !isRenamingTree;

  return (
    <TreeItemContextMenu
      tree={tree}
      rootAttrs={rootAttrs}
      xmlDeclaration={xmlDeclaration}
      showDeleteMenu={showDeleteMenu}
      setIsRenamingTree={setIsRenamingTree}
    >
      <li
        onClick={handleClick}
        onDoubleClick={handleTreeItemDoubleClick}
        onDragStart={onDragStart}
        draggable={draggable}
        className={`flex flex-row gap-2 border items-center rounded-sm mt-1 pl-2 py-1 cursor-pointer transition-colors ${
          isSelected
            ? "border-highlight"
            : "border-divider hover:border-highlight focus-within:border-highlight"
        }`}
      >
        <Network className="flex-none w-5 h-5" />

        <div className="flex-1 min-w-0">
          {!isRenamingTree && (
            <span
              className="truncate text-sm select-none block"
              title={tree.id}
            >
              {tree.id}
            </span>
          )}
          {isRenamingTree && (
            <form
              onSubmit={handleSubmit}
              className="truncate h-5"
              autoComplete="off"
            >
              <input
                className="nodrag outline-none flex-1 text-sm"
                onBlur={() => setIsRenamingTree(false)}
                autoFocus={true}
                defaultValue={tree.id}
                name="treeName"
              />
            </form>
          )}
        </div>

        {isEntryTree && (
          <BookmarkCheck className="flex-none w-4 h-4 text-status-connected mr-1" />
        )}
      </li>
    </TreeItemContextMenu>
  );
}
