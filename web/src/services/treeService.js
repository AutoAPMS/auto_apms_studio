import { addTreeToSavedJson, buildSavedJson } from "./jsonService";
import { useStore } from "../store/treeStore";

/**
 * Tree creation and manipulation service.
 * Pure functions for working with behavior tree data structures.
 */

/**
 * Creates a new tree with the given ID and updates the store.
 *
 * @param {string} treeId - The ID of the new tree.
 * @param {Object} treeData - The data of the new tree.
 */
export function createTreeAndUpdateStore(treeId, treeData) {
  const { trees, xmlDeclaration, rootAttrs, setSavedJson, setParsedData } =
    useStore.getState();

  const newTree = {
    treeData: treeData,
    id: treeId,
  };
  const {
    savedJson: updatedJson,
    rootAttrs: updatedRootAttrs,
    xmlDeclaration: updatedDeclaration,
  } = addTreeToSavedJson(newTree, trees, rootAttrs, xmlDeclaration);

  setSavedJson(updatedJson);

  setParsedData({
    trees: [...trees, newTree],
    rootAttrs: updatedRootAttrs,
    xmlDeclaration: updatedDeclaration,
  });
}

/**
 * Updates a tree in the store and rebuilds savedJson.
 *
 * @param {string} treeId - ID of the tree to update
 * @param {Object} updatedTree - New tree object { id, treeData }
 */
export function updateTreeInStore(treeId, updatedTree) {
  const { trees } = useStore.getState();

  const updatedTrees = trees.map((t) => (t.id === treeId ? updatedTree : t));

  setTreesInStore(updatedTrees);

  const { selectedTreeId, setSelectedTree } = useStore.getState();
  if (selectedTreeId === treeId && typeof setSelectedTree === "function") {
    setSelectedTree(updatedTree.treeData, treeId);
  }
}

/**
 * Sets the trees in the store and rebuilds savedJson.
 *
 * @param {[Object]} trees
 */
export function setTreesInStore(trees) {
  const { rootAttrs, xmlDeclaration, setSavedJson, setParsedData } =
    useStore.getState();

  const updatedSavedJson = buildSavedJson({
    trees: trees,
    rootAttrs: rootAttrs ?? {},
    xmlDeclaration,
  });

  setParsedData({
    trees: trees,
    rootAttrs,
    xmlDeclaration,
  });

  setSavedJson(updatedSavedJson);
}
