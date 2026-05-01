import { getOutgoers, getIncomers } from "@xyflow/react";

/**
 * @param {[Object]} nodes The array of all nodes to sort.
 * @param {[Object]} edges The array of all edges.
 * @returns The array of nodes in preorder traversal based on their position.
 */
export function getNodesInOrder(nodes, edges) {
  const rootNodes = nodes.filter(
    (node) => getIncomers(node, nodes, edges).length === 0
  );

  let orderedNodes = [];
  const addNodesInOrder = (node, nodes, edges) => {
    orderedNodes.push(node);

    const children = getOutgoers(node, nodes, edges);
    if (children.length === 0) return;

    children.sort((n1, n2) => n1.position.x - n2.position.x);

    for (let child of children) addNodesInOrder(child, nodes, edges);
  };

  for (let node of rootNodes) {
    addNodesInOrder(node, nodes, edges);
  }

  return orderedNodes;
}

/**
 * @param {{min, max : number}} range The min and max layers to consider, both inclusive.
 * @param {[Object]} nodes The array of all the nodes.
 * @returns {[Object]} A new array containing all the nodes that are between the provided range of layers.
 */
export function getNodesBetweenLayers(nodes, range) {
  return nodes.filter(
    (node) => node.data.layer >= range.min && node.data.layer <= range.max
  );
}
