import { useRef } from "react";
import XmlToJsonConverter from "../../components/XmlToJsonConverter.jsx";
import { createTreeAndUpdateStore } from "../../services/treeService.js";
import { useStore } from "../../store/treeStore.js";
import { EMPTY_TREE_TEMPLATE_Json } from "../sidebar/constants.js";
import autoapmslogo from "../../assets/autoapms_studio_header.svg";
import { Download, FilePlus, ArrowUpRight } from "lucide-react";
import { useWorkspaceRehydration } from "./hooks/useWorkspaceRehydration.js";

function EmptyWorkspaceModal({ ref }) {
  const inputRef = useRef(null);
  const setEntryTreeId = useStore((state) => state.setEntryTreeId);

  useWorkspaceRehydration(ref);

  const handleCreateNew = () => {
    const { trees, setSelectedTree } = useStore.getState();
    let num = 1;
    let treeId;
    const treeIds = trees.map((t) => t.id);
    do {
      treeId = `NewTree${num++}`;
    } while (treeIds.includes(treeId));

    const treeData = EMPTY_TREE_TEMPLATE_Json.treeData;
    createTreeAndUpdateStore(treeId, treeData);
    setSelectedTree(treeData, treeId);
    ref?.current?.close();
  };

  return (
    <dialog className="modal" ref={ref} onCancel={(e) => e.preventDefault()}>
      <div className="modal-box animated-border p-0 max-w-2xl">
        <div className="flex flex-col items-center px-8 py-8 gap-6 text-text text-center">
          <img src={autoapmslogo} alt="AutoAPMS" className="h-16" />

          <div>
            <h2 className="font-semibold text-lg">
              Welcome to AutoAPMS Studio
            </h2>
            <p className="text-sm text-text opacity-60 mt-1">
              Import your existing project or start fresh.
            </p>
          </div>

          <div className="flex gap-6">
            <button
              className="flex flex-col items-center justify-center gap-3 w-48 h-32 rounded-lg bg-input-field border-2 border-divider hover:border-highlight hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer"
              onClick={() => inputRef.current.click()}
            >
              <Download className="w-10 h-10" />
              <span className="text-sm font-medium">Import</span>
            </button>

            <button
              className="flex flex-col items-center justify-center gap-3 w-48 h-32 rounded-lg bg-input-field border-2 border-divider hover:border-highlight hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer"
              onClick={handleCreateNew}
            >
              <FilePlus className="w-10 h-10" />
              <span className="text-sm font-medium">Create New</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-divider text-sm flex items-center justify-center">
          <a
            href="https://auto-apms-studio-d50829.pages.git-ce.rwth-aachen.de/docs/"
            tabIndex={-1}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-highlight transition-colors"
          >
            Need help? Open the docs
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <XmlToJsonConverter
          ref={inputRef}
          onLoad={() => {
            setEntryTreeId(null);
            ref?.current?.close();
          }}
        />
      </div>
    </dialog>
  );
}

export default EmptyWorkspaceModal;
