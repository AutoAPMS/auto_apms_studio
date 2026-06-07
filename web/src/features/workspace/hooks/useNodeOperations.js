import { useCallback } from "react";
import { addEdge, getOutgoers, getIncomers, useReactFlow } from "@xyflow/react";
import { snapPositionToLayer } from "../utils/layoutUtils.js";
import { isRootOrDecorator } from "../utils/nodeHelpers.js";
import { useDnD } from "../../../context/DragDropContext.jsx";
import { useStore } from "../../../store/treeStore.js";
import { treeToIR } from "../../../services/treeToIrConverter.js";
import { IrToFlow } from "../../../services/irToFlowConverter.js";
import { useNodeContext } from "../../../context/NodeContext.jsx";

export default function useNodeOperations(
  setNodes,
  setEdges,
  getId,
  treeLayers,
  elkOptions,
  setTreeLayers,
  onTreeChange,
  setError
) {
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const [dnDInfo, setDnDInfo] = useDnD();
  const { nodeData: nodeModels, getNodeDataByRef, setError: setGlobalError } = useNodeContext();

  const onConnect = useCallback(
    (params) => {
      setEdges((currentEdges) => {
        const updatedEdges = addEdge(params, currentEdges);
        if (onTreeChange) {
          onTreeChange(getNodes(), updatedEdges);
        }
        return updatedEdges;
      });
    },
    [setEdges, getNodes, onTreeChange]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!dnDInfo) {
        return;
      }
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const snappedPosition = snapPositionToLayer(flowPosition, treeLayers);

      const uniqueRef = dnDInfo.subtreeId
        ? "SubTree"
        : dnDInfo.nodeUniqueReference;
      const resolvedModel = getNodeDataByRef(uniqueRef);

      if (!resolvedModel) {
        setError(new Error(`Unknown node: ${uniqueRef}`));
        return;
      }

      if (resolvedModel.pid) {
        const conflict = getNodes()
          .filter((n) => !n.data?.inSubtree)
          .find((n) => {
            const nd = n.data?.nodeData;
            return (
              nd &&
              nd.node_name === resolvedModel.node_name &&
              nd.nodeUniqueReference !== resolvedModel.nodeUniqueReference
            );
          });
        if (conflict) {
          setGlobalError(
            new Error(
              `Cannot insert '${resolvedModel.node_name}': a node from a different manifest` +
                ` ('${conflict.data.nodeData.nodeUniqueReference}') is already on the canvas.`
            )
          );
          setDnDInfo(null);
          return;
        }
      }

      const nodeData = { ...resolvedModel, subtreeId: dnDInfo.subtreeId };

      const newNode = {
        id: getId(),
        position: {
          x: flowPosition.x - 160,
          y: snappedPosition.position.y,
        },
        data: {
          nodeData: nodeData,
          layer: snappedPosition.layer,
          expanded: false,
        },
        type: dnDInfo.subtreeId ? "subtreeNode" : "behaviorTreeNode",
        style: { opacity: 0 },
      };

      let subtreeNodes = [];
      let subtreeEdges = [];

      if (dnDInfo.subtreeId) {
        const trees = useStore.getState().trees;
        const treeToLoad = trees.find((t) => t.id === dnDInfo.subtreeId).treeData;

        let result;

        try {
          const ir = treeToIR(treeToLoad, nodeModels, trees);
          result = IrToFlow([ir], getId, true);
        } catch (e) {
          setError(e);
          result = { nodes: [], edges: [] };
        }
        subtreeNodes = result.nodes.slice(1);
        subtreeEdges = result.edges.slice(1);

        if (subtreeNodes.length > 0) {
          const firstNode = subtreeNodes[0];

          const subtreeEdge = {
            id: `e-${newNode.id}-${firstNode.id}`,
            source: newNode.id,
            target: firstNode.id,
            deletable: false,
            style: { opacity: 0 },
          };
          subtreeEdges.unshift(subtreeEdge);
        }
      }

      const currentNodes = getNodes();
      const allNodes = [...currentNodes, newNode, ...subtreeNodes];

      setNodes(allNodes);
      setEdges((edges) => [...edges, ...subtreeEdges]);
      setDnDInfo(null);
    },
    [
      dnDInfo,
      screenToFlowPosition,
      treeLayers,
      getNodeDataByRef,
      getId,
      getNodes,
      setNodes,
      setEdges,
      nodeModels,
      setError,
      setGlobalError,
      setDnDInfo,
    ]
  );

  const isValidConnection = useCallback(
    (connection) => {
      const nodes = getNodes();
      const edges = getEdges();
      const source = nodes.find((node) => node.id === connection.source);
      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target.id === connection.source) return false;
      if (getIncomers(target, nodes, edges).length > 0) return false;
      if (
        isRootOrDecorator(source) &&
        getOutgoers(source, nodes, edges).length > 0
      )
        return false;

      return !hasCycle(target);
    },
    [getNodes, getEdges]
  );

  const onConnectStart = useCallback(
    (_, params) => {
      const nodes = getNodes();
      const edges = getEdges();
      const edge = edges.find((edge) => edge.source === params.nodeId);
      const source = nodes.find((node) => node.id === params.nodeId);

      if (isRootOrDecorator(source) && edge !== undefined) {
        setEdges((edges) => edges.filter((e) => e.id !== edge.id));
      }
    },
    [getNodes, getEdges, setEdges]
  );

  const onSelectNode = useCallback(
    (nodeUniqueRef, position, parent) => {
      const flowPosition = screenToFlowPosition({
        x: position.x,
        y: position.y,
      });

      const snappedPosition = snapPositionToLayer(flowPosition, treeLayers);
      const resolvedModel = getNodeDataByRef(nodeUniqueRef);

      if (!resolvedModel) {
        setError(new Error(`Unknown node: ${nodeUniqueRef}`));
        return;
      }

      if (resolvedModel.pid) {
        const conflict = getNodes()
          .filter((n) => !n.data?.inSubtree)
          .find((n) => {
            const nd = n.data?.nodeData;
            return (
              nd &&
              nd.node_name === resolvedModel.node_name &&
              nd.nodeUniqueReference !== resolvedModel.nodeUniqueReference
            );
          });
        if (conflict) {
          setGlobalError(
            new Error(
              `Cannot insert '${resolvedModel.node_name}': a node from a different manifest` +
                ` ('${conflict.data.nodeData.nodeUniqueReference}') is already on the canvas.`
            )
          );
          return;
        }
      }

      const newNode = {
        id: getId(),
        position: {
          x: flowPosition.x - 160,
          y: snappedPosition.position.y,
        },
        data: {
          nodeData: resolvedModel,
          layer: snappedPosition.layer,
        },
        type: resolvedModel.node_name === "SubTree" ? "subtreeNode" : "behaviorTreeNode",
        style: { opacity: 0 },
      };

      const currentNodes = getNodes();
      const allNodes = [...currentNodes, newNode];

      setNodes(allNodes);
      setEdges((edges) => {
        const updatedEdges = addEdge(
          {
            source: parent.id,
            target: newNode.id,
            sourceHandle: null,
            targetHandle: null,
          },
          edges
        );
        if (onTreeChange) {
          onTreeChange(allNodes, updatedEdges);
        }

        return updatedEdges;
      });
    },
    [
      screenToFlowPosition,
      treeLayers,
      getNodeDataByRef,
      setNodes,
      getId,
      getNodes,
      setEdges,
      setError,
      setGlobalError,
      onTreeChange,
    ]
  );

  return {
    onConnect,
    onDragOver,
    onDrop,
    isValidConnection,
    onConnectStart,
    onSelectNode,
  };
}
