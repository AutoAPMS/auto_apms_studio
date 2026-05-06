import { AlertCircle, Info } from "lucide-react";
import { useDroneStatus } from "./hooks/useDroneStatus";
import { useMission } from "./hooks/useMission";
import {
  buildJsonToXml,
  wrapTreeInRoot,
} from "../../../../services/xmlService";
import { useStore } from "./../../../../store/treeStore.js";
import { buildDeployJson } from "../../../../services/jsonService";
import TreePanel from "../CreateView/components/TreePanel/TreePanel.jsx";
import StatusPill from "./components/StatusPill.jsx";
import ConnectionInput from "./components/ConnectionInput.jsx";
import { useState } from "react";

export default function DeployView() {
  const {
    connected,
    ping,
    executorAvailable,
    error: connectionError,
    ip,
    port,
    setIp,
    setPort,
    connect,
    disconnect,
  } = useDroneStatus();
  const [deployError, setDeployError] = useState(null);
  const {
    missionStatus,
    missionError,
    isRunning,
    isCancelling,
    deploy,
    cancel,
  } = useMission(ip, port);
  const savedJson = useStore((state) => state.savedJson);
  const selectedTree = useStore((state) => state.selectedTree);
  const selectedTreeId = useStore((state) => state.selectedTreeId);
  const rootAttrs = useStore((state) => state.rootAttrs);
  const xmlDeclaration = useStore((state) => state.xmlDeclaration);
  const displayError = missionError || connectionError || deployError;
  const entryTreeId = useStore((state) => state.entryTreeId);
  const allTrees = useStore((state) => state.trees);
  const treeManifests = useStore((state) => state.treeManifests);

  const handleDeploy = () => {
    setDeployError(null);

    if (!entryTreeId) {
      setDeployError("Deploy failed: No entry tree selected.");
      return;
    }

    try {
      const deployJson = buildDeployJson(
        entryTreeId,
        allTrees,
        rootAttrs,
        xmlDeclaration
      );
      const xmlContent = buildJsonToXml(deployJson);

      const usedManifests = Object.entries(treeManifests)
        .filter(
          ([treeId, manifest]) =>
            manifest && allTrees.some((t) => t.id === treeId)
        )
        .map(([, manifest]) => {
          if (typeof manifest === "object" && manifest !== null) {
            return manifest.manifest;
          }
          return manifest;
        });

      const uniqueManifests = [...new Set(usedManifests)];
      const nodeManifest = uniqueManifests.join(",");

      const executor =
        treeManifests[entryTreeId]?.executor ?? "/tree_executor/start";

      const payload = JSON.stringify({
        build_request: xmlContent,
        build_handler: "auto_apms_behavior_tree::TreeFromStringBuildHandler",
        entry_point: entryTreeId,
        node_manifest: nodeManifest,
        executor: executor,
      });

      deploy(payload);
    } catch (error) {
      setDeployError(`Failed to build deploy XML: ${error.message}`);
      console.error("Failed to build deploy XML:", error);
    }
  };

  return (
    <div className="h-full w-full flex flex-col text-text font-mono text-sm select-none">
      <div className="flex-none p-2">
        <StatusPill connected={connected} ping={ping} />
      </div>

      <div className="flex-none h-px bg-divider" />

      <div className="flex-none px-2 pt-2">
        <ConnectionInput
          ip={ip}
          port={port}
          onIpChange={setIp}
          onPortChange={setPort}
          disabled={connected}
        />
      </div>

      <div className="flex-none p-2">
        <button
          onClick={connected ? disconnect : connect}
          // TODO: Extract Red color from Error Message Component and here and add it to the theme
          className={`w-full py-1.5 text-xs font-bold tracking-wider bg-divider rounded transition-colors cursor-pointer border ${
            connected
              ? "hover:bg-[#ff627d] border-highlight"
              : "hover:bg-highlight border-transparent"
          } text-text`}
        >
          {connected ? "DISCONNECT" : "CONNECT"}
        </button>
      </div>

      <div className="flex-none h-px bg-divider" />

      <div className="flex-1 min-h-0 p-2 flex flex-col gap-2">
        <p className="text-xs font-bold text-text text-center tracking-wider">
          SELECT BEHAVIOR TREE
        </p>
        <TreePanel showHeader={false} />
      </div>

      {(displayError || missionStatus) && (
        <>
          <div className="flex-none h-px bg-divider" />
          <div
            className={`flex-none flex items-start gap-2 px-3 py-2 text-xs ${
              displayError
                ? "text-[#ff627d] bg-input-field"
                : "text-emerald-400 bg-emerald-950/30"
            }`}
          >
            {displayError ? (
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            ) : (
              <span className="mt-0.5 shrink-0">
                <Info className="w-4 h-4" />
              </span>
            )}
            <span>{displayError || missionStatus}</span>
          </div>
        </>
      )}

      <div className="flex-none h-px bg-divider" />

      <div className="flex-none flex gap-2 p-2">
        <div className="relative group flex-1">
          <button
            onClick={handleDeploy}
            disabled={!connected || !entryTreeId || isRunning}
            className="w-full py-2 text-xs font-bold tracking-widest bg-emerald-700 hover:bg-emerald-600 text-text rounded cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRunning ? "DEPLOYING" : "DEPLOY"}
          </button>
          {!entryTreeId && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-45 bg-input-field border border-divider rounded-md px-3 py-2 text-xs text-text shadow-lg hidden group-hover:block">
              Default Tree must be selected. Right-click a tree and set as
              default.
            </div>
          )}
        </div>
        <button
          onClick={cancel}
          disabled={!isRunning || isCancelling}
          className="flex-1 py-2 text-xs font-bold tracking-widest bg-input-field hover:bg-highlight text-text rounded cursor-pointer transition-colors border border-divider disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isCancelling ? "CANCELLING" : "CANCEL"}
        </button>
      </div>
    </div>
  );
}
