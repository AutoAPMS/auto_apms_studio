import {
  DEFAULT_XML_DECLARATION,
  DEFAULT_ROOT_ATTRS,
} from "../features/sidebar/constants";
import { collectSubtreeDependencies } from "../utils/treeDependencyUtils.js";

/**
 * parseSavedJson
 *
 * Normalizes the imported saved JSON structure into a list of behavior trees
 * and extracts metadata required for XML export.
 *
 * Responsibilities:
 * - Extracts the XML declaration if present
 * - Collects root-level XML attributes
 * - Flattens all BehaviorTree entries into a normalized list
 * - Handles malformed data gracefully
 *
 * @param {Array|Object|null} savedJson - Parsed JSON representation of the XML file.
 * @returns {Object} result
 * @returns {Array<{ id: string, treeData: Object }>} result.trees - Normalized list of behavior trees.
 * @returns {Object} result.rootAttrs - Attributes of the root XML node.
 * @returns {Object|null} result.xmlDeclaration - XML declaration object if present, otherwise null.
 * @returns {Array<string>} result.errors - Array of parsing errors encountered (if any).
 * @returns {Object}
 */
export function parseSavedJson(savedJson) {
  const errors = [];

  if (!savedJson) {
    return { trees: [], rootAttrs: {}, xmlDeclaration: null, errors: [] };
  }

  let xmlDeclaration = null;

  try {
    if (Array.isArray(savedJson) && savedJson[0]?.["?xml"]) {
      const declaration = savedJson[0];
      xmlDeclaration = {
        "?xml": declaration["?xml"] ?? [{ "#text": "" }],
        ":@": declaration[":@"] ?? {},
      };
    }
  } catch (error) {
    errors.push(`Failed to parse XML declaration: ${error.message}`);
  }

  const rootItem = Array.isArray(savedJson)
    ? savedJson.find((item) => item?.root)
    : savedJson;

  if (!rootItem?.root) {
    errors.push("No root element found in JSON structure");
    return { trees: [], rootAttrs: {}, xmlDeclaration, errors };
  }

  const root = rootItem.root;

  if (!Array.isArray(root)) {
    errors.push("Root element is not an array");
    return {
      trees: [],
      rootAttrs: rootItem[":@"] || {},
      xmlDeclaration,
      errors,
    };
  }

  const treesRaw = [];

  root.forEach((el, index) => {
    try {
      if (!el || typeof el !== "object") {
        errors.push(`Root element at index ${index} is not an object`);
        return;
      }

      if (!el.BehaviorTree) {
        return;
      }

      const behaviorTrees = Array.isArray(el.BehaviorTree)
        ? el.BehaviorTree
        : [el.BehaviorTree];

      behaviorTrees.forEach((bt, btIndex) => {
        if (!bt || typeof bt !== "object") {
          errors.push(
            `BehaviorTree at root[${index}].BehaviorTree[${btIndex}] is not an object`
          );
          return;
        }

        treesRaw.push({
          container: el,
          content: { BehaviorTree: bt },
        });
      });
    } catch (error) {
      errors.push(
        `Error parsing root element at index ${index}: ${error.message}`
      );
    }
  });

  const trees = treesRaw.map((t, index) => {
    try {
      const id = t.container?.[":@"]?.["@_ID"];

      if (!id) {
        errors.push(`Tree at index ${index} is missing ID attribute`);
      }

      return {
        id: id || `Unnamed_${index}`,
        treeData: t.content,
      };
    } catch (error) {
      errors.push(`Error processing tree at index ${index}: ${error.message}`);
      return {
        id: `Error_${index}`,
        treeData: t.content,
      };
    }
  });

  const rootAttrs = rootItem[":@"] || {};

  let entryTreeId = null;
  const mainTreeFromAttrs = rootAttrs["@_main_tree_to_execute"];
  if (mainTreeFromAttrs && trees.some((t) => t.id === mainTreeFromAttrs)) {
    entryTreeId = mainTreeFromAttrs;
  }

  if (errors.length > 0) {
    console.warn("Errors encountered while parsing saved JSON:", errors);
  }

  return { rootAttrs, trees, xmlDeclaration, entryTreeId, errors };
}

/**
 * buildSavedJson
 *
 * Reconstructs the full XML-compatible JSON structure from normalized tree data.
 * This is the inverse operation of parseSavedJson.
 *
 * Responsibilities:
 * - Reconstructs the XML declaration
 * - Rebuilds the root element with attributes
 * - Nests all BehaviorTree entries in the correct structure
 * - Validates input data
 *
 * @param {Object} params
 * @param {Array<{ id: string, treeData: Object }>} params.trees - Normalized list of behavior trees
 * @param {Object} params.rootAttrs - Attributes of the root XML node
 * @param {Object|null} params.xmlDeclaration - XML declaration object or null
 * @returns {Array<Object>} XML-ready JSON structure that can be passed to buildJsonToXml
 * @throws {Error} If required parameters are missing or invalid
 */
export function buildSavedJson({ trees, rootAttrs, xmlDeclaration }) {
  if (!Array.isArray(trees)) {
    throw new Error("trees must be an array");
  }

  if (!rootAttrs || typeof rootAttrs !== "object") {
    return null;
  }

  const root = [];

  trees.forEach((tree) => {
    if (!tree.id) {
      console.warn("Tree missing ID, skipping:", tree);
      return;
    }

    if (!tree.treeData?.BehaviorTree) {
      console.warn(`Tree "${tree.id}" missing BehaviorTree data, skipping`);
      return;
    }

    root.push({
      BehaviorTree: [tree.treeData.BehaviorTree],
      ":@": {
        "@_ID": tree.id,
      },
    });
  });

  const result = [];

  if (xmlDeclaration) {
    result.push({
      "?xml": xmlDeclaration["?xml"] ?? [{ "#text": "" }],
      ":@": xmlDeclaration[":@"] ?? {},
    });
  }

  result.push({
    root: root,
    ":@": rootAttrs,
  });

  return result;
}

/**
 * applyEntryTreeIdToSavedJson
 *
 * Returns the savedJson with the root attribute
 * `@_main_tree_to_execute` set to the provided entryTreeId.
 *
 * @param {Array|Object|null} savedJson
 * @param {string} entryTreeId
 * @returns {Array|Object|null}
 */
export function applyEntryTreeIdToSavedJson(savedJson, entryTreeId) {
  if (!savedJson || !entryTreeId) return savedJson;

  const rootItem = Array.isArray(savedJson)
    ? savedJson.find((item) => item?.root)
    : savedJson?.root
      ? savedJson
      : null;

  if (!rootItem || typeof rootItem !== "object") return savedJson;

  rootItem[":@"] = {
    ...(rootItem[":@"] ?? {}),
    "@_main_tree_to_execute": entryTreeId,
  };

  return savedJson;
}

/**
 * addTreeToSavedJson
 *
 * Adds a new tree to an existing savedJson structure without modifying
 * root attributes or XML declaration.
 * If no savedJson exists yet, initializes a new project with default
 * XML declaration and root attributes from constants.
 *
 * @param {Object} newTree - Tree object with { id, treeData }
 * @param {Array<Object>|null} existingTrees - Current trees from store, or null
 * @param {Object|null} rootAttrs - Current root attributes from store, or null
 * @param {Object|null} xmlDeclaration - Current XML declaration from store, or null
 * @returns {{ savedJson: Array<Object>, rootAttrs: Object, xmlDeclaration: Object }}
 */
export function addTreeToSavedJson(
  newTree,
  existingTrees,
  rootAttrs,
  xmlDeclaration
) {
  const activeRootAttrs = rootAttrs ?? DEFAULT_ROOT_ATTRS;
  const activeXmlDeclaration = xmlDeclaration ?? DEFAULT_XML_DECLARATION;
  const trees = existingTrees ?? [];

  const updatedSavedJson = buildSavedJson({
    trees: [...trees, newTree],
    rootAttrs: activeRootAttrs,
    xmlDeclaration: activeXmlDeclaration,
  });

  return {
    savedJson: updatedSavedJson,
    rootAttrs: activeRootAttrs,
    xmlDeclaration: activeXmlDeclaration,
  };
}

/**
 * buildDeployJson
 *
 * Builds XML for Backend deployment. Includes entry tree and all required subtrees.
 * sets main_tree_to_execute in root-attrs to entryTreeId
 *
 * @param entryTreeId - ID of the entry tree to deploy
 * @param allTrees - All trees stored in the store
 * @param rootAttrs - Root XML attributes from the store
 * @param xmlDeclaration - XML declaration from the store
 * @return {Array<Object>} - XML ready to be deployed
 * @throws {Error} - If entryTreeId is not found in allTrees
 */
export function buildDeployJson(
  entryTreeId,
  allTrees,
  rootAttrs,
  xmlDeclaration
) {
  const entryTree = allTrees.find((t) => t.id === entryTreeId);
  if (!entryTree) {
    throw new Error(
      `Error - Could not find Entry Tree "${entryTreeId}" in store`
    );
  }

  const needed = new Set([entryTreeId]);
  const queue = [entryTree];

  while (queue.length > 0) {
    const current = queue.shift();
    const deps = collectSubtreeDependencies(current.treeData);

    deps.forEach((depId) => {
      if (!needed.has(depId)) {
        needed.add(depId);
        const depTree = allTrees.find((t) => t.id === depId);

        if (depTree) {
          queue.push(depTree);
        } else {
          console.warn(
            `Subtree "${depId}" is referenced by "${current.id}" but not found in store`
          );
        }
      }
    });
  }

  const deployTrees = allTrees.filter((t) => needed.has(t.id));

  const deployRootAttrs = {
    ...rootAttrs,
    "@_main_tree_to_execute": entryTreeId,
  };

  return buildSavedJson({
    trees: deployTrees,
    rootAttrs: deployRootAttrs,
    xmlDeclaration,
  });
}
