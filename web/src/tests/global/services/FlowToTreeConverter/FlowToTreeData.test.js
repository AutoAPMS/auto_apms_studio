import { describe, test, expect } from "vitest";
import { flowToTreeData } from "../../../../services/flowToTreeConverter";

describe("flowToTreeData", () => {
  test("returns empty BehaviorTree when no children under root", () => {
    const result = flowToTreeData([], []);

    expect(result).toEqual({ BehaviorTree: {} });
  });

  test("converts single node tree", () => {
    const nodes = [
      {
        id: "root",
        data: {},
        position: { x: 0, y: 0 },
      },
      {
        id: "n1",
        position: { x: 0, y: 100 },
        data: {
          nodeData: {
            node_name: "AlwaysSuccess",
            input_ports: [],
            output_ports: [],
            input_output_ports: [],
          },
        },
      },
    ];

    const edges = [{ source: "root", target: "n1" }];

    const result = flowToTreeData(nodes, edges);

    expect(result).toEqual({
      BehaviorTree: {
        AlwaysSuccess: [],
      },
    });
  });

  test("includes subtree ID as @_ID attribute", () => {
    const nodes = [
      { id: "root", data: {}, position: { x: 0, y: 0 } },
      {
        id: "n1",
        position: { x: 0, y: 100 },
        data: {
          nodeData: {
            node_name: "SubTree",
            subtreeId: "MySubTree",
          },
        },
      },
    ];

    const edges = [{ source: "root", target: "n1" }];

    const result = flowToTreeData(nodes, edges);

    expect(result).toEqual({
      BehaviorTree: {
        SubTree: [],
        ":@": { "@_ID": "MySubTree" },
      },
    });
  });

  test("exports port values as @_portName attributes", () => {
    const nodes = [
      { id: "root", data: {}, position: { x: 0, y: 0 } },
      {
        id: "n1",
        position: { x: 0, y: 100 },
        data: {
          nodeData: {
            node_name: "Action",
            input_ports: [{ name: "speed", default: "5" }],
            output_ports: [],
            input_output_ports: [],
          },
        },
      },
    ];

    const edges = [{ source: "root", target: "n1" }];

    const result = flowToTreeData(nodes, edges);

    expect(result).toEqual({
      BehaviorTree: {
        Action: [],
        ":@": { "@_speed": "5" },
      },
    });
  });

  test("exports decorator attributes with @__ prefix", () => {
    const nodes = [
      { id: "root", data: {}, position: { x: 0, y: 0 } },
      {
        id: "n1",
        position: { x: 0, y: 100 },
        data: {
          nodeData: {
            node_name: "Condition",
            attributes: {
              skipIf: "x > 5",
            },
          },
        },
      },
    ];

    const edges = [{ source: "root", target: "n1" }];

    const result = flowToTreeData(nodes, edges);

    expect(result).toEqual({
      BehaviorTree: {
        Condition: [],
        ":@": { "@__skipIf": "x > 5" },
      },
    });
  });

  test("builds hierarchy from edges", () => {
    const nodes = [
      { id: "root", data: {}, position: { x: 0, y: 0 } },
      {
        id: "parent",
        position: { x: 0, y: 100 },
        data: { nodeData: { node_name: "Sequence" } },
      },
      {
        id: "child",
        position: { x: 0, y: 200 },
        data: { nodeData: { node_name: "AlwaysSuccess" } },
      },
    ];

    const edges = [
      { source: "root", target: "parent" },
      { source: "parent", target: "child" },
    ];

    const result = flowToTreeData(nodes, edges);

    expect(result).toEqual({
      BehaviorTree: {
        Sequence: [{ AlwaysSuccess: [] }],
      },
    });
  });

  test("orders siblings by x position", () => {
    const nodes = [
      { id: "root", data: {}, position: { x: 0, y: 0 } },
      {
        id: "left",
        position: { x: 100, y: 100 },
        data: { nodeData: { node_name: "LeftNode" } },
      },
      {
        id: "right",
        position: { x: 300, y: 100 },
        data: { nodeData: { node_name: "RightNode" } },
      },
      {
        id: "parent",
        position: { x: 200, y: 50 },
        data: { nodeData: { node_name: "Sequence" } },
      },
    ];

    const edges = [
      { source: "root", target: "parent" },
      { source: "parent", target: "right" },
      { source: "parent", target: "left" }, // intentionally reversed
    ];

    const result = flowToTreeData(nodes, edges);

    expect(result).toEqual({
      BehaviorTree: {
        Sequence: [{ LeftNode: [] }, { RightNode: [] }],
      },
    });
  });
});
