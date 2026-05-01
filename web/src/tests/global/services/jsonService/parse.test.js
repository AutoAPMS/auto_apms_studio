import { describe, it, expect } from "vitest";
import {
  parseSavedJson,
  applyEntryTreeIdToSavedJson,
} from "../../../../services/jsonService.js";
const sampleJson = [
  {
    "?xml": [{ "#text": "" }],
    ":@": { "@_version": "1.0", "@_encoding": "UTF-8" },
  },
  {
    root: [
      {
        BehaviorTree: [{ AlwaysSuccess: [] }],
        ":@": { "@_ID": "Tree1" },
      },
    ],
    ":@": { "@_BTCPP_format": "4" },
  },
];

describe("jsonService - parseSavedJson", () => {
  it("parses valid saved JSON correctly", () => {
    const { trees, rootAttrs, xmlDeclaration, errors, entryTreeId } =
      parseSavedJson(sampleJson);
    expect(errors).toHaveLength(0);
    expect(trees).toHaveLength(1);
    expect(trees[0].id).toBe("Tree1");
    expect(trees[0].treeData.BehaviorTree.AlwaysSuccess).toBeDefined();
    expect(rootAttrs["@_BTCPP_format"]).toBe("4");
    expect(xmlDeclaration).toBeDefined();
    expect(entryTreeId).toBe(null);
  });

  it("respects main_tree_to_execute from root attributes", () => {
    const json = [
      sampleJson[0],
      {
        ...sampleJson[1],
        ":@": { ...sampleJson[1][":@"], "@_main_tree_to_execute": "Tree1" },
      },
    ];

    const { entryTreeId } = parseSavedJson(json);
    expect(entryTreeId).toBe("Tree1");
  });

  it("does not fall back when main_tree_to_execute is invalid", () => {
    const json = [
      sampleJson[0],
      {
        ...sampleJson[1],
        ":@": { ...sampleJson[1][":@"], "@_main_tree_to_execute": "Missing" },
      },
    ];

    const { entryTreeId } = parseSavedJson(json);
    expect(entryTreeId).toBe(null);
  });

  it("returns empty result when savedJson is null", () => {
    const result = parseSavedJson(null);

    expect(result.trees).toEqual([]);
    expect(result.rootAttrs).toEqual({});
    expect(result.xmlDeclaration).toBe(null);
    expect(result.errors).toEqual([]);
  });

  it("handles missing root element", () => {
    const result = parseSavedJson([{ notRoot: [] }]);

    expect(result.trees).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles root not being an array", () => {
    const bad = [{ root: {} }];

    const result = parseSavedJson(bad);

    expect(result.trees).toEqual([]);
    expect(result.rootAttrs).toEqual({});
  });

  it("handles tree missing ID", () => {
    const bad = [
      {
        root: [
          {
            BehaviorTree: [{ AlwaysSuccess: [] }],
            ":@": {}, // no @_ID
          },
        ],
      },
    ];

    const result = parseSavedJson(bad);

    expect(result.trees[0].id).toContain("Unnamed");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns empty arrays for null input", () => {
    const { trees, rootAttrs, xmlDeclaration, errors } = parseSavedJson(null);
    expect(trees).toHaveLength(0);
    expect(rootAttrs).toEqual({});
    expect(xmlDeclaration).toBeNull();
    expect(errors).toHaveLength(0);
  });

  it("applies entryTreeId to savedJson", () => {
    const savedJson = JSON.parse(JSON.stringify(sampleJson));
    const modified = applyEntryTreeIdToSavedJson(savedJson, "Tree1");

    expect(modified[1][":@"]["@_main_tree_to_execute"]).toBe("Tree1");
    expect(savedJson[1][":@"]["@_main_tree_to_execute"]).toBe("Tree1");
  });

  it("handles malformed root gracefully", () => {
    const badJson = [{ root: null }];
    const { errors } = parseSavedJson(badJson);
    expect(errors).toContain("No root element found in JSON structure");
  });
});
