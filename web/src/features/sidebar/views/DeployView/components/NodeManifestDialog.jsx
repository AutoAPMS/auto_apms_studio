import { useRef, useState } from "react";
import { NotebookText, X, Info } from "lucide-react";
import { useStore } from "../../../../../store/treeStore.js";
import CustomDropdown from "../../../../../components/CustomDropdown.jsx";

const DEFAULT_EXECUTOR = "/tree_executor/start";

export function useNodeManifestDialog(treeId) {
  const dialogRef = useRef(null);
  const treeManifests = useStore((state) => state.treeManifests);
  const setTreeManifest = useStore((state) => state.setTreeManifest);
  const backendHost = useStore((state) => state.backendHost);

  const [selectedManifest, setSelectedManifest] = useState("");
  const [selectedExecutor, setSelectedExecutor] = useState(DEFAULT_EXECUTOR);
  const [availableManifests, setAvailableManifests] = useState([]);
  const [availableExecutors, setAvailableExecutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const [manifestsRes, executorsRes] = await Promise.all([
        fetch(`${backendHost}/api/v1/manifests/`),
        fetch(`${backendHost}/api/v1/executors/`),
      ]);
      if (manifestsRes.ok) {
        const data = await manifestsRes.json();
        setAvailableManifests(data.manifests ?? []);
      }
      if (executorsRes.ok) {
        const data = await executorsRes.json();
        setAvailableExecutors(data.executors ?? []);
      }
    } catch {
      setFetchError("Failed to load options from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    const persisted = treeManifests[treeId];
    setSelectedManifest(persisted?.manifest ?? "");
    setSelectedExecutor(persisted?.executor ?? DEFAULT_EXECUTOR);
    setFetchError(null);
    dialogRef.current?.showModal();
    fetchOptions();
  };

  const handleApply = () => {
    setTreeManifest(treeId, {
      executor: selectedExecutor,
      manifest: selectedManifest,
      manifestString: selectedManifest,
    });
    dialogRef.current?.close();
  };

  const handleReset = () => {
    const persisted = treeManifests[treeId];
    setSelectedManifest(persisted?.manifest ?? "");
    setSelectedExecutor(persisted?.executor ?? DEFAULT_EXECUTOR);
  };

  const dialog = (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box bg-input-field border border-divider p-0 max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <div className="flex items-center gap-2 text-text">
            <NotebookText className="w-5 h-5" />
            <span className="font-semibold text-lg">NODE MANIFEST</span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center text-text cursor-pointer hover:bg-highlight border border-transparent hover:border-divider rounded-md transition-colors"
            onClick={() => dialogRef.current?.close()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          {fetchError && <p className="text-xs text-red-400">{fetchError}</p>}

          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <p className="uppercase">Node Manifest</p>
              <div className="relative group">
                <Info className="w-4 h-4 text-highlight cursor-help" />
                <div className="absolute left-6 top-0 z-50 w-72 bg-input-field border border-divider rounded-md px-3 py-2 text-xs text-text shadow-lg hidden group-hover:block">
                  <p>
                    Select the Node Manifest Identity to load for this Tree.
                  </p>
                  <p className="mt-1 text-gray-500 font-mono">
                    e.g. fosdem26_autoapms_behavior::wave_right
                  </p>
                </div>
              </div>
            </div>
            <CustomDropdown
              value={selectedManifest}
              onChange={setSelectedManifest}
              options={
                availableManifests.length > 0
                  ? [
                      { value: "", label: "None" },
                      ...availableManifests.map(({ identity }) => ({
                        value: identity,
                        label: identity,
                      })),
                    ]
                  : [
                      {
                        value: "",
                        label: loading ? "Loading…" : "No manifests available",
                      },
                    ]
              }
              placeholder={loading ? "Loading…" : "Select manifest…"}
            />
          </div>

          <div>
            <p className="text-xs uppercase text-gray-500 mb-2">Executor</p>
            <CustomDropdown
              value={selectedExecutor}
              onChange={setSelectedExecutor}
              options={
                availableExecutors.length > 0
                  ? availableExecutors.map((ex) => ({ value: ex, label: ex }))
                  : [{ value: DEFAULT_EXECUTOR, label: DEFAULT_EXECUTOR }]
              }
              placeholder={loading ? "Loading…" : "Select executor…"}
            />
          </div>
        </div>

        <div className="h-px bg-divider" />

        <div className="flex items-center gap-2 px-4 py-4">
          <button
            className="px-3 py-1 text-sm font-medium rounded-md cursor-pointer bg-green-600/80 border-2 border-green-800 text-white hover:bg-green-800 transition-colors"
            onClick={handleApply}
          >
            Apply Changes
          </button>
          <button
            className="px-2 h-8 flex items-center justify-center text-sm rounded-sm bg-input-field hover:bg-highlight border-0 cursor-pointer text-text transition-colors"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </dialog>
  );

  return { handleOpen, dialog };
}
