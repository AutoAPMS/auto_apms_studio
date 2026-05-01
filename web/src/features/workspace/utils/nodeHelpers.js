/**
 * Checks if a node is a root or a decorator.
 * @param {Object} node
 * @returns {boolean}
 */
export const isRootOrDecorator = (node) => {
  return (
    isRoot(node) || node.data?.nodeData?.node_type === "NodeType.DECORATOR"
  );
};

/**
 * Checks if a node is the root node.
 * @param {Object} node
 * @returns {boolean}
 */
export const isRoot = (node) => {
  return node.type === "rootNode";
};

/**
 * Checks if a node is a subtree node.
 * @param {Object} node
 * @returns {boolean}
 */
export const isSubtree = (node) => {
  return node.type === "subtreeNode";
};
