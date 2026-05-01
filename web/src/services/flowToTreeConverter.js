/**
 * Converts ReactFlow nodes and edges back into a BehaviorTree treeData structure.
 * Skips the root node and reconstructs the tree hierarchy from edges.
 *
 * @param {Array<Object>} nodes - ReactFlow nodes
 * @param {Array<Object>} edges - ReactFlow edges
 * @returns {Object} treeData - { BehaviorTree: { NodeName: [...], ":@": {...} } }
 */
export function flowToTreeData(nodes, edges) {
  const nodeMap = new Map(
    nodes.filter((node) => node.data.inSubtree !== true).map((n) => [n.id, n])
  );
  const filteredEdges = edges.filter(
    (edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target)
  );

  // Build adjacency map: parentId → [childId, ...]
  const childrenMap = new Map();
  filteredEdges.forEach(({ source, target }) => {
    if (!childrenMap.has(source)) childrenMap.set(source, []);
    childrenMap.get(source).push(target);
  });

  /**
   * Recursively converts a ReactFlow node into a BehaviorTree JSON node.
   *
   * @param {string} nodeId - ReactFlow node ID
   * @returns {Object|null} BehaviorTree node structure
   */
  function walk(nodeId) {
    const node = nodeMap.get(nodeId);
    if (!node) return null;

    const nodeData = node.data?.nodeData;
    if (!nodeData) return null;

    const nodeName = nodeData.node_name;
    const attrs = {};
    if (nodeData.subtreeId) {
      attrs["@_ID"] = nodeData.subtreeId;
    }
    // Rebuild port attributes with @_ prefix
    const allPorts = [
      ...(nodeData.input_ports ?? []),
      ...(nodeData.output_ports ?? []),
      ...(nodeData.input_output_ports ?? []),
      ...(nodeData.remapped_ports ?? []),
    ];

    allPorts.forEach((port) => {
      if (port.default !== "" && port.default !== undefined) {
        attrs[`@_${port.name}`] = port.default;
      }
    });

    // Rebuild attribute decorators with @__ prefix
    if (nodeData.attributes) {
      Object.entries(nodeData.attributes).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          attrs[`@__${key}`] = value;
        }
      });
    }

    // Get children sorted by x position (left to right = sibling order)
    const childIds = (childrenMap.get(nodeId) ?? []).sort((a, b) => {
      const nodeA = nodeMap.get(a);
      const nodeB = nodeMap.get(b);
      return (nodeA?.position?.x ?? 0) - (nodeB?.position?.x ?? 0);
    });

    const children = childIds.map((childId) => walk(childId)).filter(Boolean);

    return {
      [nodeName]: children,
      ...(Object.keys(attrs).length > 0 && { ":@": attrs }),
    };
  }

  // Start from root's first child
  const rootChildren = childrenMap.get("root") ?? [];

  if (rootChildren.length === 0) {
    return { BehaviorTree: {} };
  }

  const firstNodeId = rootChildren[0];
  const treeContent = walk(firstNodeId);

  return {
    BehaviorTree: treeContent,
  };
}
