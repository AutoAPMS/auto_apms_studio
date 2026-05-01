import ELK from "elkjs/lib/elk.bundled.js";
import {
  createLayer,
  createLayerAfterLast,
  getNearestLayer,
} from "../utils/layoutUtils.js";
import { getIncomers } from "@xyflow/react";
import { isRoot } from "../utils/nodeHelpers.js";

/**
 * @param {[Object]} nodes The ordered array of all nodes.
 * @param {[Object]} edges The array of all edges.
 * @param options A dictionary of all layout options.
 * @returns The layouted nodes and edges based on the provided options.
 */
export function getLayoutedElements(nodes, edges, options = {}) {
  const elk = new ELK();
  const isHorizontal = options?.["elk.direction"] === "RIGHT";

  const visibleNodes = nodes.filter((node) => node.hidden !== true);

  const rootNode = visibleNodes.find((node) => isRoot(node));
  const separatedNodes = visibleNodes.filter(
    (node) =>
      !isRoot(node) && getIncomers(node, visibleNodes, edges).length === 0
  );
  const nodesToLayout = [
    ...visibleNodes,
    { ...rootNode, id: "PlaceholderRoot" },
  ];
  const nodeMap = new Map(nodesToLayout.map((node) => [node.id, node]));

  const edgesToLayout = [
    ...edges.filter(
      (edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target)
    ),
    ...separatedNodes.map((node) => ({
      id: `e-PlaceholderRoot-${node.id}`,
      source: "PlaceholderRoot",
      target: node.id,
    })),
  ];

  const graph = {
    id: "root",
    layoutOptions: { ...options, "elk.hierarchyHandling": "INCLUDE_CHILDREN" },
    children: nodesToLayout.map((node) => ({
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",

      width: node.measured?.width ?? node.width ?? 150,
      height: node.measured?.height ?? node.height ?? 50,

      x: node.position?.x ?? 0,
      y: node.position?.y ?? 0,

      layoutOptions: { "elk.alignment": "TOP" },
    })),
    edges: edgesToLayout,
  };

  const mapToFlow = (layoutedGraph) => {
    let layers = [...new Set(layoutedGraph.children.map((n) => n.y))].sort(
      (a, b) => a - b
    );

    if (layers.length === 1)
      layers = [
        ...layers,
        createLayer(layers[0], rootNode.measured.height, options),
      ];

    layers = layers.slice(1, layers.length);

    const elkNodes = new Map(
      layoutedGraph.children.map((node) => [node.id, node])
    );

    const layoutedNodes = nodes.map((node) => {
      if (!elkNodes.has(node.id)) return node;

      const elkNode = elkNodes.get(node.id);
      const updatedPosition = { x: elkNode.x, y: elkNode.y };
      return {
        ...node,
        position: updatedPosition,
        data: {
          ...node.data,
          layer: getNearestLayer(updatedPosition, layers),
        },
      };
    });

    return {
      nodes: layoutedNodes,
      edges: edges,
      layers: createLayerAfterLast(layers, layoutedNodes, options),
    };
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => mapToFlow(layoutedGraph))
    .catch(console.error);
}
