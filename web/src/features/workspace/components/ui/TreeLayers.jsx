import { useReactFlow, useViewport } from "@xyflow/react";

/**
 * @param {Object} props
 * @param {[number]} props.layers The ReactFlow positions where a layer will be drawn
 * @param {number} props.offset An offset that is added to each layer.
 * @returns {React.JSX.Element} A ReactFlow background that draws lines for each layer
 * @component
 */
function TreeLayers({ layers, offset }) {
  const { flowToScreenPosition } = useReactFlow();
  const { zoom } = useViewport();

  const lineWidth = zoom;

  const layerLines = layers.map((layer) => {
    const linePos = flowToScreenPosition({ x: 0, y: layer + offset });
    return (
      <line
        key={linePos.y}
        x1={0}
        y1={linePos.y}
        x2="100%"
        y2={linePos.y}
        stroke="currentColor"
        strokeWidth={lineWidth}
        strokeDasharray="5,5"
      />
    );
  });

  return (
    <svg className="tree-layers w-full h-full text-text">{layerLines}</svg>
  );
}

export default TreeLayers;
