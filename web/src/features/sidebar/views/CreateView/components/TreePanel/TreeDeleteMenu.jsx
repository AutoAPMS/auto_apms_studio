import { Trash, X, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { useTreeRefactor } from "../../../../hooks/useTreeRefactor.js";
import { checkRefactor } from "../../../../utils/treeRefactorUtils.js";
import { useStore } from "../../../../../../store/treeStore.js";

/**
 * A popup for deleting behavior trees.
 *
 * @param {Object} props
 * @param {String} props.treeId - The ID of the tree that should be deleted.
 */
function DeleteTreeMenu({ ref, treeId }) {
  const trees = useStore((state) => state.trees);
  const { deleteTree } = useTreeRefactor();
  const [tooltip, setTooltip] = useState(null);

  const usages = useMemo(() => checkRefactor(trees, treeId), [treeId, trees]);

  const handleDelete = (shouldRefactor) => {
    deleteTree(treeId, shouldRefactor);
    ref.current?.close();
  };

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box bg-input-field border-2 p-0 max-w-md border-[#ff627d] overflow-visible">
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <div className="flex items-center gap-2 text-text">
            <Trash className="w-6 h-6" />
            <span className="font-semibold text-lg">Delete</span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center text-text cursor-pointer hover:bg-highlight border border-transparent hover:border-divider rounded-md transition-colors"
            onClick={() => ref.current?.close()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="text-sm text-text mb-3">
            Delete '{treeId}' and, optionally, its usages.
          </div>
          <div className="flex gap-1.5 text-sm text-text mt-3">
            This tree is used as subtree in {usages.length} other tree
            {usages.length !== 1 ? "s" : ""}.
            {usages.length > 0 && (
              <div
                className="relative"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setTooltip("usage");
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <Info className="w-3.5 h-5.5" />
                {tooltip === "usage" && (
                  <div className="absolute bottom-5 left-0 min-w-28 bg-input-field border border-divider text-text text-xs px-2 py-1 rounded-md shadow-md z-50 text-left whitespace-pre-line">
                    <ul className="overflow-y-auto overflow-x-hidden max-h-20">
                      {usages.map((usage) => (
                        <li key={usage} title={usage} className="truncate">
                          {usage}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-divider" />

        <div className="flex items-center justify-left gap-2 px-4 py-4">
          <div className="flex items-center">
            <button
              className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-md cursor-pointer bg-[#ff627d]/50 border-2 border-[#ff627d] text-white hover:bg-[#ff627d]/40 transition-colors"
              onClick={() => handleDelete(true)}
            >
              Smart Delete
              <div
                className="relative"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setTooltip("smart");
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <Info className="w-3.5 h-3.5" />
                {tooltip === "smart" && (
                  <div className="absolute bottom-6 left-0 w-56 bg-input-field border border-divider text-text text-xs px-2 py-1 rounded-md shadow-md z-50 text-left whitespace-pre-line">
                    Deletes the selected tree and all usages as a subtree.
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="flex items-center">
            <button
              className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-md cursor-pointer bg-[#ff627d]/50 border-2 border-[#ff627d] text-white hover:bg-[#ff627d]/40 transition-colors"
              onClick={() => handleDelete(false)}
            >
              Force Delete
              <div
                className="relative"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setTooltip("force");
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <Info className="text-border w-3.5 h-3.5" />
                {tooltip === "force" && (
                  <div className="absolute bottom-6 left-0 w-56 bg-input-field border border-divider text-text text-xs px-2 py-1 rounded-md shadow-md z-50 text-left whitespace-pre-line">
                    Deletes only the selected tree, ignoring its usages as a
                    subtree.
                  </div>
                )}
              </div>
            </button>
          </div>

          <button
            className="px-2 h-8 flex items-center justify-center text-sm rounded-sm bg-input-field hover:bg-highlight border-0 cursor-pointer text-text transition-colors"
            onClick={() => ref.current?.close()}
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default DeleteTreeMenu;
