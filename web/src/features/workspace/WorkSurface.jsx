import { useRef, useState, useMemo } from "react";
import { useStore } from "../../store/treeStore.js";
import { treeToIR } from "../../services/treeToIrConverter.js";
import { IrToFlow } from "../../services/irToFlowConverter.js";
import FlowCanvas from "./FlowCanvas.jsx";
import WorkspaceContextMenu from "./components/popups/WorkspaceContextMenu.jsx";
import useTreeChange from "./hooks/useTreeChange.js";
import useNodeIdGenerator from "./hooks/useNodeIdGenerator.js";
import { checkCircularDependencies } from "../../utils/treeDependencyUtils.js";
import { ErrorAlert } from "../../components/ErrorAlert.jsx";
import EmptyWorkspaceModal from "./EmptyWorkspaceModal.jsx";

/**
 * WorkSurface Component
 *
 * Converts the currently selected behavior tree from the global store
 * into an Intermediate Representation (IR), then into nodes and edges
 * suitable for rendering in ReactFlow. It automatically updates when
 * the selected tree or node models change.
 *
 * @param {Object} props
 * @param {Array<Object>} props.nodeModels - The available node models for parsing the tree
 *
 * @component
 * @returns {React.JSX.Element}
 */
export default function WorkSurface({ nodeModels }) {
  const selectedTree = useStore((state) => state.selectedTree);
  const selectedTreeId = useStore((state) => state.selectedTreeId);
  const trees = useStore((state) => state.trees);
  const [error, setError] = useState(null);

  const root = {
    id: "root",
    position: { x: 0, y: 0 },
    type: "rootNode",
    deletable: false,
    draggable: false,
    selectable: false,
  };

  const { getNodeId, setNodeId } = useNodeIdGenerator(selectedTreeId);

  const initialNodesRef = useRef([]);
  const initialEdgesRef = useRef([]);
  const lastConvertedIdRef = useRef(null);
  const emptyModalRef = useRef(null);

  const nodeModelsReady = nodeModels && nodeModels.length > 0;

  if (
    nodeModelsReady &&
    selectedTree &&
    selectedTreeId !== lastConvertedIdRef.current
  ) {
    lastConvertedIdRef.current = selectedTreeId;
    setNodeId(0);
    setError(null);

    try {
      const tree = trees.find((t) => t.id === selectedTreeId);
      const hasCycle = checkCircularDependencies([tree], trees, []).get(
        selectedTreeId
      );
      const ir = treeToIR(selectedTree, nodeModels, trees, !hasCycle);
      const result = IrToFlow([ir], getNodeId);

      if (hasCycle) setError(new Error("Tree contains a circular dependency"));

      initialNodesRef.current = result.nodes;
      initialEdgesRef.current = result.edges;
    } catch (e) {
      setError(e);
      initialNodesRef.current = [root];
      initialEdgesRef.current = [];
    }
  }

  const handleTreeChange = useTreeChange(trees);

  return (
    <>
      <div className="flex-1 h-full">
        <WorkspaceContextMenu>
          <FlowCanvas
            initialNodes={initialNodesRef.current}
            initialEdges={initialEdgesRef.current}
            onTreeChange={handleTreeChange}
            getId={getNodeId}
          />
        </WorkspaceContextMenu>
      </div>

      <EmptyWorkspaceModal ref={emptyModalRef} />

      <ErrorAlert error={error} onClose={() => setError(null)} />
    </>
  );
}
