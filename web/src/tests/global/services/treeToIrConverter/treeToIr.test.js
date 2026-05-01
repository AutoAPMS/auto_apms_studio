import { describe, it, expect } from "vitest";
import { treeToIR } from "../../../../services/treeToIrConverter.js";
import { EMPTY_TREE_TEMPLATE_Json } from "../../../../features/sidebar/constants.js";

describe("treeToIR", () => {
  const dummyModels = [{ node_name: "AlwaysSuccess", node_type: "leaf" }];
  const dummyTrees = [EMPTY_TREE_TEMPLATE_Json];

  it("throws on empty BehaviorTree", () => {
    expect(() => treeToIR({}, dummyModels, dummyTrees)).toThrow(
      "Invalid BehaviorTree JSON"
    );
    expect(() => treeToIR(null, dummyModels, dummyTrees)).toThrow(
      "Invalid BehaviorTree JSON"
    );
    expect(() =>
      treeToIR({ BehaviorTree: null }, dummyModels, dummyTrees)
    ).toThrow("Invalid BehaviorTree JSON");
  });

  it("throws if node model is missing", () => {
    const tree = { BehaviorTree: { UnknownNode: [] } };
    expect(() => treeToIR(tree, dummyModels, dummyTrees)).toThrow(
      "Unknown node model: UnknownNode"
    );
  });

  it("converts a simple tree to IR(single node with no ports or attributes)", () => {
    const tree = { BehaviorTree: { AlwaysSuccess: [] } };
    const models = [{ node_name: "AlwaysSuccess", node_type: "action" }];
    const ir = treeToIR(tree, models, dummyTrees);

    expect(ir).toHaveProperty("id");
    expect(ir.type).toBe("AlwaysSuccess");
    expect(ir.children).toHaveLength(0);
    expect(ir.ports.input).toHaveLength(0);
    expect(ir.attributes).toEqual({});
  });

  it("handles input, output, and inout ports", () => {
    const tree = {
      BehaviorTree: {
        NodeWithPorts: [],
        ":@": { "@_in1": "valIn", "@_out1": "valOut", "@_io1": "valInOut" },
      },
    };

    const models = [
      {
        node_name: "NodeWithPorts",
        node_type: "action",
        input_ports: [{ name: "in1" }],
        output_ports: [{ name: "out1" }],
        input_output_ports: [{ name: "io1" }],
      },
    ];

    const ir = treeToIR(tree, models, dummyTrees);

    expect(ir.ports.input).toHaveLength(1);
    expect(ir.ports.input[0].name).toBe("in1");
    expect(ir.ports.input[0].value).toBe("valIn");

    expect(ir.ports.output).toHaveLength(1);
    expect(ir.ports.output[0].name).toBe("out1");
    expect(ir.ports.output[0].value).toBe("valOut");

    expect(ir.ports.inout).toHaveLength(1);
    expect(ir.ports.inout[0].name).toBe("io1");
    expect(ir.ports.inout[0].value).toBe("valInOut");
  });

  it("assigns correct types for all attributes", () => {
    const tree = {
      BehaviorTree: {
        NodeWithAttrs: [],
        ":@": {
          "@__skipIf": "skip",
          "@__successIf": "success",
          "@__failureIf": "fail",
          "@__while": "loop",
          "@__onSuccess": "postSuccess",
          "@__onFailure": "postFailure",
          "@__onHalted": "postHalted",
          "@__post": "postGeneral",
        },
      },
    };

    const models = [{ node_name: "NodeWithAttrs", node_type: "action" }];

    const ir = treeToIR(tree, models, dummyTrees);

    // PRE attributes
    ["skipIf", "successIf", "failureIf", "while"].forEach((attr) =>
      expect(ir.attributes[attr].type).toBe("PRE")
    );

    // POST attributes
    ["onSuccess", "onFailure", "onHalted", "post"].forEach((attr) =>
      expect(ir.attributes[attr].type).toBe("POST")
    );

    // Check values
    expect(ir.attributes.skipIf.value).toBe("skip");
    expect(ir.attributes.onSuccess.value).toBe("postSuccess");
  });

  it("converts a tree with nested children to IR", () => {
    const tree = {
      BehaviorTree: {
        Sequence: [{ AlwaysSuccess: [] }, { AlwaysSuccess: [] }],
      },
    };
    const models = [
      { node_name: "Sequence", node_type: "composite" },
      { node_name: "AlwaysSuccess", node_type: "action" },
    ];

    const ir = treeToIR(tree, models, dummyTrees);
    expect(ir.children).toHaveLength(2);
    expect(ir.children[0].type).toBe("AlwaysSuccess");
    expect(ir.children[1].type).toBe("AlwaysSuccess");
  });

  it("should load subtrees", () => {
    const models = [
      { node_name: "Sequence", node_type: "composite" },
      { node_name: "AlwaysSuccess", node_type: "leaf" },
      { node_name: "SubTree" },
    ];

    const dummyTrees = [
      {
        id: "TestTree",
        treeData: {
          BehaviorTree: {
            Sequence: [{ AlwaysSuccess: [] }, { AlwaysSuccess: [] }],
          },
        },
      },
    ];

    const tree = {
      BehaviorTree: {
        SubTree: [],
        ":@": { "@_ID": "TestTree" },
      },
    };

    const ir = treeToIR(tree, models, dummyTrees);

    expect(ir.type).toBe("SubTree");
    expect(ir.subtreeId).toBe("TestTree");

    expect(ir.children).toHaveLength(1);
    expect(ir.children[0].type).toBe("Sequence");

    expect(ir.children[0].children).toHaveLength(2);
    expect(ir.children[0].children[0].type).toBe("AlwaysSuccess");
    expect(ir.children[0].children[1].type).toBe("AlwaysSuccess");
  });

  it("should handle port remapping ", () => {
    const tree = {
      BehaviorTree: {
        SubTree: [],
        ":@": { "@_in1": "valIn", "@__out1": "valOut", "@_io1": "valInOut" },
      },
    };

    const models = [{ node_name: "SubTree" }];

    const ir = treeToIR(tree, models, dummyTrees);

    const expected = [
      { name: "in1", default: "valIn" },
      { name: "_out1", default: "valOut" },
      { name: "io1", default: "valInOut" },
    ];

    expect(ir.ports.remap).toStrictEqual(expected);
  });
});
