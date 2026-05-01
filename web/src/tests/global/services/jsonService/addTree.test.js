import { describe, it, expect } from "vitest";
import { addTreeToSavedJson } from "../../../../services/jsonService.js";

describe("jsonService - addTreeToSavedJson", () => {
  const tree = {
    id: "Tree1",
    treeData: { BehaviorTree: { AlwaysSuccess: [] } },
  };
  const rootAttrs = { "@_BTCPP_format": "4" };
  const xmlDeclaration = { "?xml": [{ "#text": "" }], ":@": {} };

  it("adds a tree to empty saved JSON", () => {
    const { savedJson } = addTreeToSavedJson(
      tree,
      [],
      rootAttrs,
      xmlDeclaration
    );
    expect(savedJson[1].root[0][":@"]["@_ID"]).toBe("Tree1");
  });

  it("adds a tree to existing trees", () => {
    const existing = [{ id: "Tree0", treeData: { BehaviorTree: {} } }];
    const { savedJson } = addTreeToSavedJson(
      tree,
      existing,
      rootAttrs,
      xmlDeclaration
    );
    expect(savedJson[1].root).toHaveLength(2);
    expect(savedJson[1].root[1][":@"]["@_ID"]).toBe("Tree1");
  });

  it("uses default attributes if none provided", () => {
    const {
      savedJson,
      rootAttrs: ra,
      xmlDeclaration: xd,
    } = addTreeToSavedJson(tree, null, null, null);
    expect(ra).toBeDefined();
    expect(xd).toBeDefined();
    expect(savedJson[1].root[0][":@"]["@_ID"]).toBe("Tree1");
  });
});
