import { isSubtree } from "./nodeHelpers.js";

/**
 * @param {Object} root - The root node of the subtree.
 * @param {[Object]} nodes - The array of all nodes.
 * @param {[Object]} edges - The array of all edges.
 * @param {Boolean} getEntireTree - If the result should include the children of subtree nodes.
 * @returns {{nodes: [Object], edges: [Object]}} - The subsets of all nodes and edges that belong to the subtree.
 */
export function getSubtree(root, nodes, edges, getEntireTree = true) {
  const subtreeNodes = [];
  const subtreeEdges = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    subtreeNodes.push(node);

    if (!getEntireTree && isSubtree(node) && node.id !== root.id) continue;

    edges
      .filter((edge) => edge.source === node.id)
      .forEach((edge) => {
        subtreeEdges.push(edge);
        const child = nodes.find((n) => n.id === edge.target);
        queue.push(child);
      });
  }
  return { nodes: subtreeNodes, edges: subtreeEdges };
}
