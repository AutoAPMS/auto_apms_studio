import { useMemo, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useNodeContext } from "../../context/NodeContext.jsx";

import BehaviorTreeNode from "./components/nodes/BehaviorTreeNode.jsx";
import RootNode from "./components/nodes/RootNode.jsx";
import SubtreeNode from "./components/nodes/SubtreeNode.jsx";
import TreeLayers from "./components/ui/TreeLayers.jsx";
import TreeControls from "./components/ui/TreeControls.jsx";

import useTreeState from "./hooks/useTreeState.js";
import useTreeLayout from "./hooks/useTreeLayout.js";
import useLayerManagement from "./hooks/useLayerManagement.js";
import useSubtreeOperations from "./hooks/useSubtreeOperations.js";
import useNodeOperations from "./hooks/useNodeOperations.js";
import useNodesDelete from "./hooks/useNodesDelete.js";
import usePortChange from "./hooks/usePortChange.js";
import useAttributeChange from "./hooks/useAttributeChange.js";
import { useCopyPaste } from "./hooks/useCopyPaste.js";
import { useConnectionNodeList } from "./hooks/useConnectionNodeList.js";
import ConnectionNodeList from "./components/ui/ConnectionNodeList.jsx";
import { useNodeInitialization } from "./hooks/useNodeInitialization.js";
import { ErrorAlert } from "../../components/ErrorAlert.jsx";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.js";
import usePortRemap from "./hooks/usePortRemap.js";
/**
 * FlowCanvas
 *
 * Reusable ReactFlow canvas responsible for:
 * - Rendering nodes and edges (parsed from a Behavior Tree or added dynamically)
 * - Synchronizing external graph state into ReactFlow
 * - Supporting drag & drop of new nodes
 * - Allowing interactive node movement and edge connections
 *
 * This component does NOT handle tree parsing itself.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.initialNodes - Initial ReactFlow nodes to render
 * @param {Array<Object>} props.initialEdges - Initial ReactFlow edges to render
 * @param {Function} props.onTreeChange - Callback when tree structure changes
 * @param {Function} props.getId - A function that returns unique node ids
 * @returns {React.JSX.Element}
 */
export default function FlowCanvas({
  initialNodes,
  initialEdges,
  onTreeChange,
  getId,
}) {
  const { getNodeDataByName } = useNodeContext();
  const { getEdges } = useReactFlow();
  const [error, setError] = useState(null);
  const { nodeList, onConnectEnd, closeNodeList, handleMouseDown } =
    useConnectionNodeList();
  const nodesInitialized = useRef(false);

  useKeyboardShortcuts(onTreeChange);

  const nodeTypes = useMemo(
    () => ({
      behaviorTreeNode: BehaviorTreeNode,
      rootNode: RootNode,
      subtreeNode: SubtreeNode,
    }),
    []
  );

  const [elkOptions] = useState({
    "elk.algorithm": "layered",
    "elk.layered.spacing.nodeNodeBetweenLayers": 200,
    "elk.spacing.nodeNode": 80,
    "elk.layered.crossingMinimization.forceNodeModelOrder": "true",
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  });

  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    treeLayers,
    setTreeLayers,
    wasTreeLoaded,
  } = useTreeState(initialNodes, initialEdges, nodesInitialized);

  useCopyPaste(treeLayers, setTreeLayers, elkOptions);

  const { onLayout } = useTreeLayout(
    elkOptions,
    setNodes,
    setEdges,
    setTreeLayers
  );

  const { onNodeDrag, onNodeDragStop } = useLayerManagement(
    setNodes,
    setTreeLayers,
    treeLayers,
    elkOptions,
    onTreeChange
  );

  const { toggleSubtree, createSubtree, hasChildren } = useSubtreeOperations(
    setNodes,
    setEdges,
    getId,
    setTreeLayers,
    elkOptions,
    getNodeDataByName,
    onLayout,
    onTreeChange
  );
  const {
    onConnect,
    onDragOver,
    onDrop,
    isValidConnection,
    onConnectStart,
    onSelectNode,
  } = useNodeOperations(
    setNodes,
    setEdges,
    getId,
    treeLayers,
    elkOptions,
    getNodeDataByName,
    setTreeLayers,
    onTreeChange,
    setError
  );

  const { onNodesDelete, onBeforeDelete } = useNodesDelete(
    setTreeLayers,
    onTreeChange
  );
  const handlePortChange = usePortChange(setNodes, getEdges, onTreeChange);
  const handleAttributeChange = useAttributeChange(
    setNodes,
    getEdges,
    onTreeChange
  );
  const { updatePort: updatePortRemap, deletePort: deletePortRemap } =
    usePortRemap(setNodes, getEdges, onTreeChange);

  useNodeInitialization(
    wasTreeLoaded,
    onLayout,
    setTreeLayers,
    elkOptions,
    nodesInitialized
  );

  const nodesWithHandlers = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onToggleSubtree: toggleSubtree,
          onHasChildren: hasChildren,
          onCreateSubtree: createSubtree,
          onPortChange: handlePortChange,
          onAttributeChange: handleAttributeChange,
          onRemapPortUpdate: updatePortRemap,
          onRemapPortDelete: deletePortRemap,
        },
      })),
    [
      nodes,
      toggleSubtree,
      hasChildren,
      createSubtree,
      handlePortChange,
      handleAttributeChange,
      updatePortRemap,
      deletePortRemap,
    ]
  );

  return (
    <ReactFlow
      style={{ backgroundColor: "var(--workspace)" }}
      nodes={nodesWithHandlers}
      deleteKeyCode={["Backspace", "Delete"]}
      multiSelectionKeyCode="Shift"
      selectionKeyCode="Shift"
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onConnectEnd={onConnectEnd}
      onPaneClick={closeNodeList}
      connectionRadius={30}
      proOptions={{ hideAttribution: true }}
      minZoom={0.1}
      defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
      isValidConnection={isValidConnection}
      onConnectStart={onConnectStart}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onNodesDelete={onNodesDelete}
      onBeforeDelete={onBeforeDelete}
      connectionLineType={ConnectionLineType.Bezier}
      connectionLineStyle={{ stroke: "var(--highlight)", strokeWidth: 2 }}
      defaultEdgeOptions={{
        animated: false,
        style: { strokeWidth: 2 },
      }}
    >
      <Background variant={BackgroundVariant.Dots} color="var(--highlight)" />
      <TreeControls onLayout={onLayout} />
      <TreeLayers layers={treeLayers} offset={30} />
      <ConnectionNodeList
        nodeList={nodeList}
        handleMouseDown={handleMouseDown}
        closeNodeList={closeNodeList}
        onSelect={onSelectNode}
      />
      <ErrorAlert error={error} onClose={() => setError(null)} />
    </ReactFlow>
  );
}
