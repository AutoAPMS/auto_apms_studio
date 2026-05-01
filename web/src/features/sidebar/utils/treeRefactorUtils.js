/**
 * Renames or deletes all occurrences of the specified subtree in the given tree.
 *
 * @param {Object} tree - The tree to update.
 * @param {String} subtreeId - The ID of the subtree that should be renamed or deleted.
 * @param {String} newSubtreeId - The ID the subtree should be renamed to.
 *
 * @returns {Object} The updated tree.
 */
export function refactorTree(tree, subtreeId, newSubtreeId = null) {
  let refactored = false;

  function walk(nodeObj) {
    const keys = Object.keys(nodeObj).filter((k) => k !== ":@");
    if (!keys.length) return null;

    const nodeName = keys[0];
    const childrenRaw = nodeObj[nodeName] || [];
    let rawAttrs = nodeObj[":@"] || {};

    if (nodeName === "SubTree" && rawAttrs["@_ID"] === subtreeId) {
      refactored = true;
      if (!newSubtreeId) return null;

      rawAttrs = {
        ...rawAttrs,
        "@_ID": newSubtreeId,
      };
    }

    return {
      [nodeName]: childrenRaw.map((n) => walk(n)).filter(Boolean),
      ":@": rawAttrs,
    };
  }

  return {
    tree: {
      ...tree,
      treeData: {
        BehaviorTree: walk(tree.treeData.BehaviorTree) ?? {},
      },
    },
    refactored: refactored,
  };
}

/**
 * Checks which trees are affected by renaming or deleting a tree.
 *
 * @param {Object} trees - An array of all trees.
 * @param {String} treeId - The ID of the tree that was renamed or deleted.
 *
 * @returns {[String]} An array of all affected tree IDs.
 */
export function checkRefactor(trees, treeId) {
  return trees.reduce((acc, currTree) => {
    return refactorTree(currTree, treeId).refactored
      ? [...acc, currTree.id]
      : acc;
  }, []);
}

/**
 * Renames all occurrences of the specified subtree.
 *
 * @param {[Object]} nodes - An array of all nodes in the workspace.
 * @param {String} subtreeId - The ID of the subtree that should be renamed.
 * @param {String} newSubtreeId - The ID the subtree should be renamed to.
 *
 * @returns {[Object]} The array of nodes
 */
export function renameSubtreesInWorkspace(nodes, subtreeId, newSubtreeId) {
  return nodes.map((node) => {
    if (
      node.type === "subtreeNode" &&
      node.data.nodeData.subtreeId === subtreeId
    ) {
      return {
        ...node,
        data: {
          ...node.data,
          nodeData: { ...node.data.nodeData, subtreeId: newSubtreeId },
        },
      };
    }
    return node;
  });
}

/**
 * Deletes all occurrences of the specified subtree.
 *
 * @param {[Object]} nodes - An array of all nodes in the workspace.
 * @param {[Object]} edges - An array of all edges in the workspace.
 * @param {String} subtreeId - The ID of the subtree that should be deleted.
 *
 * @returns {{nodes : Object[], edges : Object[]}} The remaining nodes and edges.
 */
export function deleteSubtreesInWorkspace(nodes, edges, subtreeId) {
  const nodesToDelete = new Set();

  function getSubtreeNodes(rootId) {
    const queue = [rootId];

    while (queue.length > 0) {
      const node = queue.shift();
      nodesToDelete.add(node);

      edges
        .filter((edge) => edge.source === node)
        .forEach((edge) => queue.push(edge.target));
    }
  }

  nodes.forEach((node) => {
    if (
      node.type === "subtreeNode" &&
      node.data.nodeData.subtreeId === subtreeId
    )
      getSubtreeNodes(node.id);
  });

  return {
    nodes: nodes.filter((n) => !nodesToDelete.has(n.id)),
    edges: edges.filter((e) => !nodesToDelete.has(e.target)),
  };
}
