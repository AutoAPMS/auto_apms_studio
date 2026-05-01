import { XMLParser, XMLBuilder } from "fast-xml-parser";

/**
 * Service for XML/JSON conversion logic.
 * Extracted from original components to keep logic separate from UI.
 */

export const xmlParserOptions = {
  ignoreAttributes: false,
  preserveOrder: true,
};

export const xmlBuilderOptions = {
  format: true,
  ignoreAttributes: false,
  preserveOrder: true,
  suppressEmptyNode: true,
  attributeValueProcessor: (name, val) => val,
};

/**
 * Parses XML text into a JSON object.
 * @param {string} xmlText
 * @returns {Object}
 */
export function parseXmlToJson(xmlText) {
  const parser = new XMLParser(xmlParserOptions);
  return parser.parse(xmlText);
}

/**
 * Builds XML text from a JSON object.
 * @param {Object} jsonObject
 * @returns {string}
 */
export function buildJsonToXml(jsonObject) {
  const builder = new XMLBuilder(xmlBuilderOptions);
  return builder.build(jsonObject);
}

/**
 * wrapTreeInRoot
 *
 * Wraps a single BehaviorTree into a full XML-compatible root structure
 * so it can be exported as a standalone XML file.
 *
 * Responsibilities:
 * - Clones the tree to avoid mutating the original data
 * - Re-attaches the XML declaration (if provided)
 * - Restores root-level attributes
 * - Wraps the BehaviorTree in the expected XML array structure
 *
 * @param {Object} tree - Raw tree object containing a `BehaviorTree` node.
 * @param {string} id - ID of the behavior tree (used as root attribute).
 * @param {Object} rootAttrs - Attributes of the original XML root node.
 * @param {Object|null} xmlDeclaration - XML declaration object (e.g. `?xml`) or null.
 *
 * @returns {Array<Object>|null} XML-ready structure for export, or null if no tree is provided.
 */

export function wrapTreeInRoot(tree, id, rootAttrs, xmlDeclaration) {
  if (!tree) return null;

  const behaviorTreeArray = [tree.BehaviorTree];

  return [
    {
      ...xmlDeclaration,
    },
    {
      root: [
        {
          BehaviorTree: behaviorTreeArray,
          ":@": { "@_ID": id },
        },
      ],
      ":@": {
        ...rootAttrs,
      },
    },
  ];
}
