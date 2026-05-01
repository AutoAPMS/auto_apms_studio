import { useNodeContext } from "../../../context/NodeContext.jsx";
import { ArrowUpRight, X } from "lucide-react";
import { useStore } from "../../../store/treeStore.js";

function WorkspaceSection({ localIp, setLocalIp, localPort, setLocalPort }) {
  const { nodeData: nodeModels } = useNodeContext();
  const hasNodeModels = Array.isArray(nodeModels) && nodeModels.length > 0;
  const trees = useStore((state) => state.trees) || [];
  const treeCount = Array.isArray(trees) ? trees.length : 0;

  const handleDownloadNodeModels = () => {
    if (!hasNodeModels) return;
    const payload = nodeModels || [];
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "node_models.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="text-xs uppercase text-gray-500 mb-3">
        WORKSPACE{" "}
        <span className="text-xs text-gray-500">({treeCount} trees)</span>
      </div>

      <div className="flex gap-2 items-center min-w-0">
        <div className="flex-1 min-w-0 bg-input-field border border-divider rounded-md px-2 py-1.5 hover:border-highlight focus-within:border-highlight transition-colors">
          <div className="flex justify-between items-center gap-2">
            <input
              className="nodrag flex-1 bg-transparent focus:outline-none text-sm min-w-0 text-text"
              value={localIp}
              onChange={(e) => setLocalIp(e.target.value)}
              placeholder="127.0.0.1"
            />
            <span className="text-xs text-text opacity-60 flex-none">IP</span>
          </div>
        </div>
        <span className="text-text opacity-60 flex-none">:</span>
        <div className="flex-1 min-w-0 bg-input-field border border-divider rounded-md px-2 py-1.5 hover:border-highlight focus-within:border-highlight transition-colors">
          <div className="flex justify-between items-center gap-2 text-text">
            <input
              className="nodrag flex-1 bg-transparent focus:outline-none text-sm min-w-0"
              value={localPort}
              onChange={(e) => setLocalPort(e.target.value)}
              placeholder="8000"
            />
            <span className="text-xs text-text opacity-60 flex-none">PORT</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleDownloadNodeModels}
          disabled={!hasNodeModels}
          aria-disabled={!hasNodeModels}
          className={
            "px-3 py-1 text-sm font-medium rounded-md border transition-colors flex items-center gap-2 justify-center " +
            (hasNodeModels
              ? "bg-input-field border-divider text-text hover:bg-highlight cursor-pointer"
              : "bg-input-field border-divider text-text opacity-50 cursor-not-allowed")
          }
        >
          {hasNodeModels ? (
            <>
              <ArrowUpRight className="w-4 h-4" />
              <span>Download {nodeModels.length} loaded Node Models</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              <span>No Node Models Loaded</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
export default WorkspaceSection;
