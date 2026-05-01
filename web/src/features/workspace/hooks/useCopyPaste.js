import { useCallback, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  createLayer,
  createLayerAfterLast,
  getNearestLayer,
  removeUnusedLayers,
  sortNodesByLayer,
} from "../utils/layoutUtils.js";
import { collisionUtils } from "../utils/collisionUtils.js";
import { getSubtree } from "../utils/subtreeUtils.js";
import { isRoot, isSubtree } from "../utils/nodeHelpers.js";

export function useCopyPaste(treeLayers, setTreeLayers, elkOptions) {
  const {
    getNodes,
    setNodes,
    getEdges,
    setEdges,
    screenToFlowPosition,
    getNodesBounds,
  } = useReactFlow();
  const mousePos = useRef({ x: 0, y: 0 });
  const copiedNodesRef = useRef([]);
  const copiedEdgesRef = useRef([]);
  const nodesBoundsRef = useRef({});

  const copy = useCallback(() => {
    const nodes = getNodes().filter(
      (node) => node.selected && !isRoot(node) && node.data.inSubtree !== true
    );

    const nodeSet = new Set(nodes.map((node) => node.id));
    const edges = getEdges().filter(
      (edge) =>
        edge.selected && nodeSet.has(edge.source) && nodeSet.has(edge.target)
    );
    copiedNodesRef.current = nodes;
    copiedEdgesRef.current = edges;

    nodes.forEach((node) => {
      if (!isSubtree(node)) return;

      const { nodes: subtreeNodes, edges: subtreeEdges } = getSubtree(
        node,
        getNodes(),
        getEdges()
      );
      copiedNodesRef.current.push(...subtreeNodes.slice(1));
      copiedEdgesRef.current.push(...subtreeEdges);
    });

    nodesBoundsRef.current = getNodesBounds(copiedNodesRef.current);
  }, [getEdges, getNodes, getNodesBounds]);

  const paste = useCallback(() => {
    if (copiedNodesRef.current.length === 0) return;

    const nodesBounds = nodesBoundsRef.current;
    const mouseFlowPosition = screenToFlowPosition(mousePos.current);

    const nodeMap = new Map(
      copiedNodesRef.current.map((node) => [
        node.id,
        node.id + "-duplicate-" + Date.now(),
      ])
    );

    const visibleNodes = copiedNodesRef.current.filter(
      (n) => n.data.inSubtree !== true
    );
    const minNode = visibleNodes.reduce((min, cur) =>
      cur.data.layer < min.data.layer ? cur : min
    );
    const maxNode = visibleNodes.reduce((max, cur) =>
      cur.data.layer > max.data.layer ? cur : max
    );

    const translateX =
      mouseFlowPosition.x - (nodesBounds.x + nodesBounds.width / 2);
    const translateY = mouseFlowPosition.y - nodesBounds.y;

    const newMinPosition = {
      x: minNode.position.x + translateX,
      y: minNode.position.y + translateY,
    };

    const newMinLayer = getNearestLayer(newMinPosition, treeLayers);
    const oldMinLayer = minNode.data.layer;
    const oldMaxLayer = maxNode.data.layer;
    const layerRange = oldMaxLayer - oldMinLayer + 1;

    let newLayers = Array.from({ length: layerRange });
    const nodesByLayer = sortNodesByLayer(
      visibleNodes.map((n) => ({
        ...n,
        data: { layer: n.data.layer - oldMinLayer },
      })),
      newLayers
    );

    const layersToLast = treeLayers.length - newMinLayer - 1;

    newLayers = [treeLayers[treeLayers.length - 1]];
    let lastLayerHeight = minNode.measured.height;
    nodesByLayer.slice(layersToLast).forEach((nodes, i) => {
      if (nodes.length > 0)
        lastLayerHeight = Math.max(...nodes.map((n) => n.measured.height));

      newLayers.push(createLayer(newLayers[i], lastLayerHeight, elkOptions));
    });

    const allLayers = treeLayers.concat(newLayers.slice(1));

    const newNodes = copiedNodesRef.current.map((node) => {
      const newLayer = node.data.layer - oldMinLayer + newMinLayer;

      const nodePosition = {
        x: node.position.x + translateX,
        y: allLayers[newLayer],
      };

      return {
        ...node,
        id: nodeMap.get(node.id),
        data: {
          ...node.data,
          expanded: false,
          layer: newLayer,
        },
        position: nodePosition,
        selected: false,
        hidden: node.data.inSubtree,
      };
    });

    const updatedNodes = getNodes().concat(newNodes);

    const newEdges = copiedEdgesRef.current.map((edge) => {
      const newSource = nodeMap.get(edge.source);
      const newTarget = nodeMap.get(edge.target);

      return {
        ...edge,
        id: `e-${newSource}-${newTarget}`,
        source: newSource,
        target: newTarget,
        selected: false,
      };
    });

    const resolvedNodes = collisionUtils(updatedNodes, {
      maxIterations: 30,
      overlapThreshold: 0.5,
      margin: 5,
    });

    setNodes(resolvedNodes);
    setEdges((currentEdges) => currentEdges.concat(newEdges));
    setTreeLayers(
      createLayerAfterLast(
        removeUnusedLayers(resolvedNodes, allLayers),
        resolvedNodes,
        elkOptions
      )
    );
  }, [
    elkOptions,
    getNodes,
    screenToFlowPosition,
    setEdges,
    setNodes,
    setTreeLayers,
    treeLayers,
  ]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === "c") copy();

      if (isCtrlOrCmd && e.key === "v") paste();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [copy, paste]);
}
