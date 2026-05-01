/**
 * Converts a BehaviorTree JSON structure into an Intermediate Representation (IR).
 *
 * The IR is a normalized, renderer-agnostic tree format that:
 * - Resolves node models
 * - Extracts ports and attributes
 * - Normalizes children
 * - Assigns stable internal IDs
 *
 * This IR is later consumed by:
 * - IrToFlow (ReactFlow rendering)
 * - Future exporters (XML / JSON)
 *
 * @param {Object} treeJson
 *   Raw BehaviorTree JSON object.
 *   Expected shape:
 *   {
 *     BehaviorTree: {
 *       NodeName: [ children... ],
 *       ":@": { attributes... }
 *     }
 *   }
 *
 * @param {Array<Object>} nodeModels
 *   List of node model definitions describing:
 *   - node_name
 *   - node_type
 *   - input_ports
 *   - output_ports
 *   - input_output_ports
 *
 * @param {Array<Object>} trees
 *   An array of all imported Behavior Trees.
 *
 * @param includeSubtrees
 *   If the result should include subtrees.
 *
 * @returns {Object|null}
 *   Root IR node or null if tree is empty.
 *
 * @throws {Error}
 *   If the BehaviorTree structure is invalid or a node model is missing.
 */
export function treeToIR(treeJson, nodeModels, trees, includeSubtrees = true) {
  if (!treeJson?.BehaviorTree || typeof treeJson.BehaviorTree !== "object") {
    throw new Error("Invalid BehaviorTree JSON");
  }

  /**
   * Fast lookup map for node models by name.
   */
  const modelMap = new Map(nodeModels.map((m) => [m.node_name, m]));

  let idCounter = 0;
  const nextId = () => `n${idCounter++}`;

  const ATTRIBUTE_META = {
    skipIf: "PRE",
    successIf: "PRE",
    failureIf: "PRE",
    while: "PRE",
    onSuccess: "POST",
    onFailure: "POST",
    onHalted: "POST",
    post: "POST",
  };

  const attributeNames = new Set([
    "skipIf",
    "successIf",
    "failureIf",
    "while",
    "onSuccess",
    "onFailure",
    "onHalted",
    "post",
    "autoremap",
    "description",
  ]);

  /**
   * Recursively converts a raw BehaviorTree node into IR form.
   *
   * @param {Object} nodeObj
   *   Single BehaviorTree node with structure:
   *   { NodeName: [...children], ":@": {...attributes} }
   *
   * @returns {Object|null}
   *   IR node or null if node is empty.
   */
  function walk(nodeObj) {
    const keys = Object.keys(nodeObj).filter((k) => k !== ":@");
    if (!keys.length) return null;

    const nodeName = keys[0];
    const childrenRaw = nodeObj[nodeName] || [];
    const rawAttrs = nodeObj[":@"] || {};

    const model = modelMap.get(nodeName);
    if (!model) {
      throw new Error(`Unknown node model: ${nodeName}`);
    }

    const ports = {
      input: [],
      output: [],
      inout: [],
      remap: [],
    };

    let instance_name = "";
    const attributes = {};

    const isSubtreeNode = nodeName === "SubTree";

    Object.entries(rawAttrs).forEach(([key, value]) => {
      const attrKey = key.slice(3);
      if (key.startsWith("@__")) {
        if (attrKey === "name") {
          instance_name = value;
          return;
        }

        if (attributeNames.has(attrKey)) {
          attributes[attrKey] = {
            key: attrKey,
            value,
            type: ATTRIBUTE_META[attrKey],
          };

          return;
        }
      }

      if (key.startsWith("@_")) {
        const portName = key.slice(2);

        if (portName === "name") {
          instance_name = value;
          return;
        }

        if (isSubtreeNode && portName !== "ID") {
          ports.remap.push({ name: portName, default: value });
          return;
        }

        const input = model.input_ports?.find((p) => p.name === portName);
        const output = model.output_ports?.find((p) => p.name === portName);
        const inout = model.input_output_ports?.find(
          (p) => p.name === portName
        );

        if (input) ports.input.push({ ...input, value });
        else if (output) ports.output.push({ ...output, value });
        else if (inout) ports.inout.push({ ...inout, value });
      }
    });

    const nodeID = nextId();
    const subtreeId = isSubtreeNode ? (rawAttrs["@_ID"] ?? null) : null;
    let children;

    if (isSubtreeNode) {
      const subtree = trees.find((t) => t.id === subtreeId);
      children =
        !subtree || !includeSubtrees
          ? []
          : [walk(subtree.treeData.BehaviorTree)];
    } else {
      children = childrenRaw.map(walk).filter(Boolean);
    }

    return {
      id: nodeID,
      type: nodeName,
      node_type: model.node_type,
      ports,
      attributes,
      subtreeId: subtreeId,
      children: children,
      instance_name: instance_name,
    };
  }

  return walk(treeJson.BehaviorTree);
}
