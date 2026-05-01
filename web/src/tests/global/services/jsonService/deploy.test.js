import { describe, it, expect, vi } from "vitest";
import {
  buildDeployJson,
  buildSavedJson,
  parseSavedJson,
} from "../../../../services/jsonService.js";

describe("jsonService - buildDeployJson", () => {
  const tree1 = {
    id: "Tree1",
    treeData: { BehaviorTree: { AlwaysSuccess: [] } },
  };

  const tree2 = {
    id: "Tree2",
    treeData: {
      BehaviorTree: {
        SubTree: [],
        ":@": { "@_ID": "Tree1" },
      },
    },
  };

  const tree3 = {
    id: "Tree3",
    treeData: {
      BehaviorTree: {
        SubTree: [],
        ":@": { "@_ID": "Tree2" },
      },
    },
  };

  const rootAttrs = { "@_BTCPP_format": "4" };
  const xmlDeclaration = { "?xml": [{ "#text": "" }], ":@": {} };

  it("builds deploy JSON with only entry tree if no subtrees", () => {
    const result = buildDeployJson("Tree1", [tree1], rootAttrs, xmlDeclaration);
    const root = result[1].root;
    expect(root).toHaveLength(1);
    expect(root[0][":@"]["@_ID"]).toBe("Tree1");
    expect(result[1][":@"]["@_main_tree_to_execute"]).toBe("Tree1");
  });

  it("throws if entry tree not found", () => {
    expect(() =>
      buildDeployJson("Missing", [tree1], rootAttrs, xmlDeclaration)
    ).toThrow('Error - Could not find Entry Tree "Missing" in store');
  });

  it("includes subtree dependencies recursively", () => {
    const result = buildDeployJson(
      "Tree3",
      [tree1, tree2, tree3],
      rootAttrs,
      xmlDeclaration
    );
    const ids = result[1].root.map((r) => r[":@"]["@_ID"]);
    expect(ids).toContain("Tree1");
    expect(ids).toContain("Tree2");
    expect(ids).toContain("Tree3");
  });

  it("sets main_tree_to_execute in root attrs", () => {
    const result = buildDeployJson("Tree1", [tree1], rootAttrs, xmlDeclaration);
    expect(result[1][":@"]["@_main_tree_to_execute"]).toBe("Tree1");
  });

  it("warns if subtree dependency not found in store", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const treeWithMissingDep = {
      id: "Tree1",
      treeData: {
        BehaviorTree: {
          SubTree: [],
          ":@": { "@_ID": "NonExistent" },
        },
      },
    };

    buildDeployJson("Tree1", [treeWithMissingDep], rootAttrs, xmlDeclaration);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("NonExistent")
    );
    warnSpy.mockRestore();
  });

  it("does not include duplicate trees", () => {
    const treeA = {
      id: "TreeA",
      treeData: {
        BehaviorTree: [
          { SubTree: [], ":@": { "@_ID": "TreeB" } },
          { SubTree: [], ":@": { "@_ID": "TreeB" } }, // duplicate dep
        ],
      },
    };
    const treeB = {
      id: "TreeB",
      treeData: { BehaviorTree: { AlwaysSuccess: [] } },
    };

    const result = buildDeployJson(
      "TreeA",
      [treeA, treeB],
      rootAttrs,
      xmlDeclaration
    );
    const ids = result[1].root.map((r) => r[":@"]["@_ID"]);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toHaveLength(uniqueIds.length);
  });
});

describe("jsonService - buildSavedJson edge cases", () => {
  it("skips tree missing id", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = buildSavedJson({
      trees: [{ id: null, treeData: { BehaviorTree: {} } }],
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: null,
    });
    expect(result[0].root).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("omits xml declaration if null", () => {
    const result = buildSavedJson({
      trees: [{ id: "T1", treeData: { BehaviorTree: { AlwaysSuccess: [] } } }],
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].root).toBeDefined();
  });
});

describe("jsonService - parseSavedJson edge cases", () => {
  it("handles non-object element in root array", () => {
    const bad = [
      {
        root: [null, { BehaviorTree: [{}], ":@": { "@_ID": "Tree1" } }],
        ":@": {},
      },
    ];
    const { trees, errors } = parseSavedJson(bad);
    expect(errors.some((e) => e.includes("not an object"))).toBe(true);
  });

  it("handles savedJson as plain object with root", () => {
    const obj = {
      root: [{ BehaviorTree: [{ AlwaysSuccess: [] }], ":@": { "@_ID": "T1" } }],
      ":@": { "@_BTCPP_format": "4" },
    };
    const { trees } = parseSavedJson(obj);
    expect(trees).toHaveLength(1);
    expect(trees[0].id).toBe("T1");
  });

  it("handles BehaviorTree as array with multiple entries", () => {
    const json = [
      {
        root: [
          {
            BehaviorTree: [{ AlwaysSuccess: [] }, { AlwaysFailure: [] }],
            ":@": { "@_ID": "Tree1" },
          },
        ],
        ":@": {},
      },
    ];
    const { trees } = parseSavedJson(json);
    expect(trees).toHaveLength(2);
  });
});
