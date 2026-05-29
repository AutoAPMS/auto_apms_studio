import Worksurface from "./features/workspace/WorkSurface.jsx";
import Sidebar from "./features/sidebar/Sidebar.jsx";
import { DnDProvider } from "./context/DragDropContext.jsx";
import { ReactFlowProvider } from "@xyflow/react";
import { NodeProvider } from "./context/NodeContext.jsx";
import { useNodeContext } from "./context/NodeContext.jsx";
import { ErrorAlert, ErrorAlertContainer } from "./components/ErrorAlert.jsx";

function AppContent() {
  const { nodeData: nodeModels, error, clearError, status } = useNodeContext();

  return (
    <div className="flex h-screen w-screen">
      <ErrorAlertContainer>
        <ErrorAlert error={error} onClose={clearError} status={status} />
      </ErrorAlertContainer>
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
