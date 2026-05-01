import Worksurface from "./features/workspace/WorkSurface.jsx";
import Sidebar from "./features/sidebar/Sidebar.jsx";
import { DnDProvider } from "./context/DragDropContext.jsx";
import { ReactFlowProvider } from "@xyflow/react";
import { NodeProvider } from "./context/NodeContext.jsx";
import { useFetchNodes } from "./features/sidebar/hooks/useFetchNodes.js";
import { useNodeContext } from "./context/NodeContext.jsx";
import { ErrorAlert } from "./components/ErrorAlert.jsx";

function AppContent() {
  const {
    nodes: nodeModels,
    error: fetchError,
    clearError: clearFetchError,
    status,
  } = useFetchNodes();
  const { error: ctxError, clearError: clearCtxError } = useNodeContext();

  return (
    <div className="flex h-screen w-screen">
      <ErrorAlert error={ctxError} onClose={clearCtxError} />
      <ErrorAlert
        error={fetchError}
        onClose={clearFetchError}
        status={status}
        className="top-24"
      />
      <Sidebar />
      <Worksurface nodeModels={nodeModels} />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <NodeProvider>
        <DnDProvider>
          <AppContent />
        </DnDProvider>
      </NodeProvider>
    </ReactFlowProvider>
  );
}

export default App;
