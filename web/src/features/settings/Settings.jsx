import { useEffect, useState } from "react";
import { useStore } from "../../store/treeStore.js";
import { Cog, X } from "lucide-react";
import ThemeSection from "./components/ThemeSection.jsx";
import WorkspaceSection from "./components/WorkspaceSection.jsx";

function SettingsMenu({ ref }) {
  const [theme, setTheme] = useState("dark");

  const backendIp = useStore((state) => state.backendIp);
  const setBackendIp = useStore((state) => state.setBackendIp);
  const backendPort = useStore((state) => state.backendPort);
  const setBackendPort = useStore((state) => state.setBackendPort);
  const triggerNodeFetch = useStore((state) => state.triggerNodeFetch);

  const [localIp, setLocalIp] = useState(backendIp);
  const [localPort, setLocalPort] = useState(backendPort);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleApply = () => {
    setBackendIp(localIp);
    setBackendPort(localPort);
    Promise.resolve().then(() => triggerNodeFetch());
    ref.current?.close();
  };

  const handleReset = () => {
    setLocalIp(backendIp);
    setLocalPort(backendPort);
  };

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box bg-input-field border border-divider p-0 max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <div className="flex items-center gap-2 text-text">
            <Cog className="w-6 h-6" />
            <span className="font-semibold text-lg">SETTINGS</span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center text-white cursor-pointer hover:bg-highlight border border-transparent hover:border-divider rounded-md transition-colors"
            onClick={() => ref.current?.close()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <ThemeSection theme={theme} setTheme={setTheme} />
          <div className="h-px bg-divider my-4 -mx-4" />
          <WorkspaceSection
            localIp={localIp}
            setLocalIp={setLocalIp}
            localPort={localPort}
            setLocalPort={setLocalPort}
          />
        </div>

        <div className="h-px bg-divider" />

        <div className="flex items-center justify-left gap-2 px-4 py-4">
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
}

export default SettingsMenu;
