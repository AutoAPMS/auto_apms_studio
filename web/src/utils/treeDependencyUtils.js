/**
 * collectSubtreeDependencies
 *
 * Traverses treeData recursively to find all SubTree nodes and collect their IDs.
 *
 * @param treeData - tree data of a single tree stored in store
 * @return {Set<unknown>} - All directly referenced ID from SubTrees
 */
export function collectSubtreeDependencies(treeData) {
  const deps = new Set();

  function walk(node) {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if ("SubTree" in node) {
      const id = node[":@"]?.["@_ID"];
      if (id) deps.add(id);
      if (Array.isArray(node.SubTree)) walk(node.SubTree);
    }

    Object.entries(node).forEach(([key, val]) => {
      if (key !== ":@") walk(val);
    });
  }

  walk(treeData);
  return deps;
}

/**
 * checkCircularDependencies
 *
 * Determines for all treesToCheck if they are part of a circular dependency.
 *
 * @param {Object[]} treesToCheck - The array of all trees that should be tested for a circular dependency.
 * @param {Object[]} trees - An array of all stored trees.
 * @param {String[]} initialDeps - An array of tree IDs that the dependencies will be initialized to.
 *
 * @return {Map<String, Boolean>} - A Map where,
 *  - Key: The tree ID
 *  - Value: True if the tree is part of a circular dependency. Otherwise, false.
 */
export function checkCircularDependencies(treesToCheck, trees, initialDeps) {
  const depsMap = new Map();
  const treeCycles = new Map();

  const walk = (tree, currDeps) => {
    if (!tree) return false;
    if (currDeps.includes(tree.id)) return true;
    if (!depsMap.has(tree.id))
      depsMap.set(tree.id, collectSubtreeDependencies(tree.treeData));

    const subtreeDeps = depsMap.get(tree.id);
    const updatedDeps = [...currDeps, tree.id];

    for (const dep of subtreeDeps) {
      const depTree = trees.find((t) => dep === t.id);
      if (walk(depTree, updatedDeps)) return true;
    }

    return false;
  };

  for (const tree of treesToCheck) {
    const hasCycle = walk(tree, initialDeps);
    treeCycles.set(tree.id, hasCycle);
  }

  return treeCycles;
}
