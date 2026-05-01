import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { getLayoutedElements } from "../services/layoutService.js";
import { getNodesInOrder } from "../services/treeService.js";

export default function useTreeLayout(
  elkOptions,
  setNodes,
  setEdges,
  setTreeLayers
) {
  const { fitView } = useReactFlow();

  const onLayout = useCallback(
    (direction, wasTreeLoaded, nodes, edges) => {
      const opts = { "elk.direction": direction, ...elkOptions };

      const nodesToLayout = wasTreeLoaded
        ? nodes
        : getNodesInOrder(nodes, edges);

      return getLayoutedElements(nodesToLayout, edges, opts).then(
        ({
          nodes: layoutedNodes,
          edges: layoutedEdges,
          layers: layoutedLayers,
        }) => {
          setTreeLayers(layoutedLayers);
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          return fitView();
        }
      );
    },
    [elkOptions, setNodes, setEdges, fitView, setTreeLayers]
  );

  return { onLayout };
}
