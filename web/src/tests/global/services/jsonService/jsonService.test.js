import { describe, it, expect } from "vitest";
import {
  parseSavedJson,
  buildSavedJson,
  addTreeToSavedJson,
} from "../../../../services/jsonService.js";

describe("jsonService - integration", () => {
  const sampleJson = [
    { "?xml": [{ "#text": "" }], ":@": { "@_version": "1.0" } },
    {
      root: [
        { BehaviorTree: [{ AlwaysSuccess: [] }], ":@": { "@_ID": "Tree1" } },
      ],
      ":@": { "@_BTCPP_format": "4" },
    },
  ];

  it("parses then builds saved JSON consistently", () => {
    const parsed = parseSavedJson(sampleJson);
    const rebuilt = buildSavedJson(parsed);
    expect(rebuilt).toEqual(sampleJson);
  });

  it("adds a tree then rebuilds correctly", () => {
    const parsed = parseSavedJson(sampleJson);
    const newTree = {
      id: "Tree2",
      treeData: { BehaviorTree: { AlwaysSuccess: [] } },
    };
    const updated = addTreeToSavedJson(
      newTree,
      parsed.trees,
      parsed.rootAttrs,
      parsed.xmlDeclaration
    );
    expect(updated.savedJson[1].root).toHaveLength(2);
    expect(updated.savedJson[1].root[1][":@"]["@_ID"]).toBe("Tree2");
  });

  it("round-trips multiple trees with different structures", () => {
    const tree1 = {
      id: "Tree1",
      treeData: {
        BehaviorTree: { Sequence: { CheckBattery: [], OpenGripper: [] } },
      },
    };
    const tree2 = {
      id: "Tree2",
      treeData: {
        BehaviorTree: { Selector: { ApproachObject: [], CloseGripper: [] } },
      },
    };
    const tree3 = {
      id: "Tree3",
      treeData: {
        BehaviorTree: {
          Sequence: [
            {
              CheckBattery: [],
            },
            {
              OpenGripper: [],
            },
            {
              ApproachObject: [],
            },
            {
              CloseGripper: [],
            },
          ],
          ":@": {
            "@__description":
              "A Sequence will execute its children in a specific order:&#10;- From left to righ (vertical tree layout) or&#10;- Top to bottom (horizontal tree layout)&#10;If a child returns FAILURE, the Sequence stops and returns FAILURE.",
          },
        },
      },
    };

    const parsed = {
      trees: [tree1],
      rootAttrs: { "@_BTCPP_format": "4" },
      xmlDeclaration: {
        "?xml": [{ "#text": "" }],
        ":@": { "@_version": "1.0" },
      },
      errors: [],
    };

    const updated = addTreeToSavedJson(
      tree2,
      parsed.trees,
      parsed.rootAttrs,
      parsed.xmlDeclaration
    );

    // map existing trees safely to pass to addTreeToSavedJson
    const existingTrees = updated.savedJson[1].root.map((r) => ({
      id: r[":@"]["@_ID"],
      treeData: {
        BehaviorTree: r.BehaviorTree[0],
      },
    }));

    // add tree3
    const final = addTreeToSavedJson(
      tree3,
      existingTrees,
      parsed.rootAttrs,
      parsed.xmlDeclaration
    );

    expect(updated.savedJson[1].root).toHaveLength(2);
    expect(final.savedJson[1].root).toHaveLength(3);

    // check IDs
    expect(final.savedJson[1].root[0][":@"]["@_ID"]).toBe("Tree1");
    expect(final.savedJson[1].root[1][":@"]["@_ID"]).toBe("Tree2");
    expect(final.savedJson[1].root[2][":@"]["@_ID"]).toBe("Tree3");

    // check that each tree keeps its unique BehaviorTree content
    const root = final.savedJson[1].root;

    // Tree1 has a Sequence with CheckBattery and OpenGripper
    expect(root[0].BehaviorTree[0]).toHaveProperty("Sequence");
    expect(root[0].BehaviorTree[0].Sequence).toHaveProperty("CheckBattery");
    expect(root[0].BehaviorTree[0].Sequence).toHaveProperty("OpenGripper");

    // Tree2 has a Selector with ApproachObject and CloseGripper
    expect(root[1].BehaviorTree[0]).toHaveProperty("Selector");
    expect(root[1].BehaviorTree[0].Selector).toHaveProperty("ApproachObject");
    expect(root[1].BehaviorTree[0].Selector).toHaveProperty("CloseGripper");

    // Tree3 has a Sequence array with children in order
    expect(root[2].BehaviorTree[0]).toHaveProperty("Sequence");
    expect(Array.isArray(root[2].BehaviorTree[0].Sequence)).toBe(true);

    // Check that each child object inside the array has the correct keys
    const seqChildren = root[2].BehaviorTree[0].Sequence;
    expect(seqChildren[0]).toHaveProperty("CheckBattery");
    expect(seqChildren[1]).toHaveProperty("OpenGripper");
    expect(seqChildren[2]).toHaveProperty("ApproachObject");
    expect(seqChildren[3]).toHaveProperty("CloseGripper");
  });
});
