/**
 * Converts an Intermediate Representation (IR) of a BehaviorTree into a format
 * suitable for rendering in ReactFlow.
 *
 * - Assigns positions for nodes based on tree depth and sibling index
 * - Converts ports from IR to nodeData with direction and default values
 * - Merges node attributes with default placeholders
 * - Generates edges connecting parent to child nodes(including root to first tree node)
 *
 * @param {Array<Object>} irNodes
 *   Array of root IR nodes as returned by `treeToIR`.
 *
 * @param {() => String} nextId
 *   A function that returns unique node ids
 *
 * @param {Boolean} inSubtree - if node is part of a subtree
 *
 * @returns {Object}
 *   An object containing:
 *   - nodes: array of nodes for ReactFlow (includes root node as first element)
 *   - edges: array of edges connecting nodes (includes root edge if tree exists)
 *
 * @example
 * const { nodes, edges } = IrToFlow([irRootNode]);
 */
export function IrToFlow(irNodes, nextId, inSubtree = false) {
  const nodes = [];
  const edges = [];
  const SPACING_X = 800;
  const SPACING_Y = 1000;

  const DEFAULT_ATTRIBUTES = {
    skipIf: "",
    successIf: "",
    failureIf: "",
    while: "",
    onSuccess: "",
    onFailure: "",
    onHalted: "",
    post: "",
    name: "",
    ID: "",
    autoremap: "",
    description: "",
  };

  /**
   * Recursively walk an IR node and populate `nodes` and `edges`.
   *
   * @param {Object} irNode - single IR node
   * @param {string|null} parentId - parent node id
   * @param {number} depth - tree depth, used for vertical positioning
   * @param {number} index - sibling index for horizontal positioning
   * @param {number} siblings - total number of siblings at this level
   * @param {Boolean} inSubtree - if node is part of a subtree
   */
  function walk(
    irNode,
    parentId = null,
    depth = 0,
    index = 0,
    siblings = 1,
    inSubtree = false
  ) {
    if (!irNode) return;

    const nodeId = nextId();

    const x = (index - (siblings - 1) / 2) * SPACING_X;
    const y = depth * SPACING_Y;

    const mergedAttributes = { ...DEFAULT_ATTRIBUTES };
    for (const [key, attr] of Object.entries(irNode.attributes || {})) {
      if (mergedAttributes[key] !== undefined)
        mergedAttributes[key] = attr.value;
    }

    if (irNode.instance_name) {
      mergedAttributes.name = irNode.instance_name;
    }

    const isSubtreeNode = irNode.node_type === "NodeType.SUBTREE";

    nodes.push({
      id: nodeId,
      type: isSubtreeNode ? "subtreeNode" : "behaviorTreeNode",
      position: { x, y },
      deletable: !inSubtree,
      draggable: !inSubtree,
      style: { opacity: 0 },
      data: {
        expanded: false,
        inSubtree: inSubtree,
        nodeData: {
          node_name: irNode.type,
          node_type: irNode.node_type,
          subtreeId: irNode.subtreeId ?? null,
          input_ports: (irNode.ports?.input || []).map((p) => ({
            name: p.name,
            type: p.type,
            default: p.value ?? "",
            direction: "IN",
          })),
          output_ports: (irNode.ports?.output || []).map((p) => ({
            name: p.name,
            type: p.type,
            default: p.value ?? "",
            direction: "OUT",
          })),
          input_output_ports: (irNode.ports?.inout || []).map((p) => ({
            name: p.name,
            type: p.type,
            default: p.value ?? "",
            direction: "IN/OUT",
          })),
          remapped_ports: irNode.ports?.remap || [],
          attributes: mergedAttributes,
        },
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        deletable: !inSubtree,
        style: { opacity: 0 },
      });
    }

    if (isSubtreeNode) inSubtree = true;

    if (Array.isArray(irNode.children)) {
      irNode.children.forEach((child, i) => {
        walk(child, nodeId, depth + 1, i, irNode.children.length, inSubtree);
      });
    }
  }

  irNodes.forEach((rootNode, i) =>
    walk(rootNode, null, 0, i, irNodes.length, inSubtree)
  );

  const rootNode = {
    id: "root",
    position: { x: 0, y: 0 },
    type: "rootNode",
    deletable: false,
    draggable: false,
    selectable: false,
    style: { opacity: 0 },
  };

  const firstTreeNode = nodes[0];
  if (firstTreeNode) {
    edges.unshift({
      id: "e-root-tree",
      source: "root",
      target: firstTreeNode.id,
      style: { opacity: 0 },
    });
  }

  nodes.unshift(rootNode);

  return { nodes, edges };
}
