import { describe, it, expect } from "vitest";
import { buildSavedJson } from "../../../../services/jsonService.js";

describe("jsonService - buildSavedJson", () => {
  const trees = [
    { id: "Tree1", treeData: { BehaviorTree: { AlwaysSuccess: [] } } },
  ];
  const rootAttrs = { "@_BTCPP_format": "4" };
  const xmlDeclaration = { "?xml": [{ "#text": "" }], ":@": {} };

  it("builds a valid saved JSON structure", () => {
    const result = buildSavedJson({ trees, rootAttrs, xmlDeclaration });
    expect(result).toHaveLength(2);
    expect(result[1].root[0][":@"]["@_ID"]).toBe("Tree1");
    expect(result[1][":@"]).toEqual(rootAttrs);
  });

  it("throws if trees is not an array", () => {
    expect(() =>
      buildSavedJson({ trees: null, rootAttrs, xmlDeclaration })
    ).toThrow("trees must be an array");
  });

  it("returns null if rootAttrs is invalid", () => {
    const result = buildSavedJson({ trees, rootAttrs: null, xmlDeclaration });
    expect(result).toBeNull();
  });

  it("skips tree missing BehaviorTree", () => {
    const result = buildSavedJson({
      trees: [{ id: "BadTree", treeData: {} }],
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: null,
    });

    expect(result[0].root).toHaveLength(0);
  });
});
