import { useCallback } from "react";
import { removeUnusedLayers } from "../utils/layoutUtils.js";
import { useReactFlow } from "@xyflow/react";
import { flowToTreeData } from "../../../services/flowToTreeConverter.js";
import { createTreeAndUpdateStore } from "../../../services/treeService.js";
import { getSubtree } from "../utils/subtreeUtils.js";

export default function useSubtreeOperations(
  setNodes,
  setEdges,
  getId,
  setTreeLayers,
  elkOptions,
  getNodeDataByName,
  onLayout,
  onTreeChange
) {
  const { getNodes, getEdges } = useReactFlow();

  const toggleSubtree = useCallback(
    (nodeId) => {
      const actualNode = getNodes().find((n) => n.id === nodeId);
      let expanded = !actualNode.data.expanded;

      const { nodes, edges } = expanded
        ? getSubtree(actualNode, getNodes(), getEdges(), false)
        : getSubtree(actualNode, getNodes(), getEdges(), true);

      const childNodesSet = new Set(nodes.map((n) => n.id));
      const childEdgesSet = new Set(edges.map((e) => e.id));

      const updatedNodes = getNodes().map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              expanded: expanded,
            },
          };
        }
        if (childNodesSet.has(n.id)) {
          return {
            ...n,
            hidden: !expanded,
            data: {
              ...n.data,
              expanded: false,
            },
          };
        }
        return n;
      });
      const updatedEdges = getEdges().map((e) => {
        if (childEdgesSet.has(e.id)) {
          return {
            ...e,
            hidden: !expanded,
          };
        }
        return e;
      });

      if (expanded) onLayout("DOWN", false, updatedNodes, updatedEdges);
      else {
        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setTreeLayers((layers) => removeUnusedLayers(updatedNodes, layers));
      }
    },
    [getEdges, getNodes, onLayout, setEdges, setNodes, setTreeLayers]
  );

  const createSubtree = useCallback(
    (nodeId, subtreeName) => {
      const actualNode = getNodes().find((node) => node.id === nodeId);
      if (!actualNode) return;

      const subtreeId = getId();

      const tmpEdges = getEdges().filter((edge) => edge.source !== "root");
      const tmpRootEdge = { source: "root", target: nodeId };

      const data = flowToTreeData(getNodes(), [tmpRootEdge, ...tmpEdges]);
      createTreeAndUpdateStore(subtreeName, data);

      const { nodes, edges } = getSubtree(actualNode, getNodes(), getEdges());
      const nodeSet = new Set(nodes.map((n) => n.id));
      const edgesSet = new Set(edges.map((e) => e.id));

      const updatedNodes = getNodes().map((n) => {
        if (nodeSet.has(n.id)) {
          return {
            ...n,
            data: {
              ...n.data,
              inSubtree: true,
            },
            deletable: false,
            draggable: false,
            hidden: true,
          };
        }
        return n;
      });
      const subtreeNode = {
        id: subtreeId,
        position: actualNode.position,
        data: {
          nodeData: {
            ...getNodeDataByName("SubTree"),
            subtreeId: subtreeName,
          },
          layer: actualNode.data.layer,
          expanded: false,
          inSubtree: false,
        },
        type: "subtreeNode",
      };
      const allNodes = updatedNodes.concat(subtreeNode);

      const updatedEdges = getEdges().map((e) => {
        if (e.target === nodeId) {
          return { ...e, target: subtreeId };
        } else if (edgesSet.has(e.id)) {
          return { ...e, hidden: true, deletable: false };
        }
        return e;
      });
      const subtreeEdge = {
        id: `e-${subtreeId}-${nodeId}`,
        source: subtreeId,
        target: nodeId,
        deletable: false,
        hidden: true,
      };
      const allEdges = updatedEdges.concat(subtreeEdge);

      setNodes(allNodes);
      setEdges(allEdges);

      if (onTreeChange) onTreeChange(allNodes, allEdges);
    },
    [
      getNodes,
      getId,
      getEdges,
      setNodes,
      setEdges,
      onTreeChange,
      getNodeDataByName,
    ]
  );

  const hasChildren = useCallback(
    (node) => {
      return getEdges().filter((edge) => edge.source === node).length !== 0;
    },
    [getEdges]
  );

  return { toggleSubtree, createSubtree, hasChildren };
}
