import { describe, it, expect, vi } from "vitest";
import { IrToFlow } from "../../../../services/irToFlowConverter.js";

const getId = vi.fn().mockReturnValue("n0");

describe("IrToFlow", () => {
  const dummyIR = [
    {
      id: "n0",
      type: "Sequence",
      node_type: "composite",
      ports: {
        input: [{ name: "in1", type: "number", value: 42 }],
        output: [{ name: "out1", type: "string", value: "ok" }],
        inout: [],
      },
      attributes: { skipIf: { value: "cond" }, unknownAttr: { value: "x" } },
      children: [
        {
          id: "n1",
          type: "AlwaysSuccess",
          node_type: "action",
          ports: {
            input: [],
            output: [],
            inout: [{ name: "inout1", type: "boolean", value: true }],
          },
          attributes: {},
          children: [],
        },
      ],
    },
  ];

  it("creates root node", () => {
    const { nodes } = IrToFlow(dummyIR, getId);
    expect(nodes[0].id).toBe("root");
    expect(nodes[0].type).toBe("rootNode");
    expect(nodes[0].position).toEqual({ x: 0, y: 0 });
  });

  it("converts IR nodes into ReactFlow nodes with correct types, ports, and attributes", () => {
    const { nodes } = IrToFlow(dummyIR, getId);

    const seqNode = nodes.find(
      (n) => n.data?.nodeData?.node_name === "Sequence"
    );
    const childNode = nodes.find(
      (n) => n.data?.nodeData?.node_name === "AlwaysSuccess"
    );
    expect(seqNode).toBeDefined();
    expect(childNode).toBeDefined();
    expect(seqNode.data.nodeData.node_type).toBe("composite");

    // ports
    expect(seqNode.data.nodeData.input_ports[0]).toEqual({
      name: "in1",
      type: "number",
      default: 42,
      direction: "IN",
    });
    expect(seqNode.data.nodeData.output_ports[0]).toEqual({
      name: "out1",
      type: "string",
      default: "ok",
      direction: "OUT",
    });
    expect(childNode.data.nodeData.input_output_ports[0]).toEqual({
      name: "inout1",
      type: "boolean",
      default: true,
      direction: "IN/OUT",
    });
    // attributes: only default ones merged
    expect(seqNode.data.nodeData.attributes.skipIf).toBe("cond");
    expect(seqNode.data.nodeData.attributes.successIf).toBe("");
    expect(seqNode.data.nodeData.attributes.unknownAttr).toBeUndefined();
  });

  it("creates edges between parent and children and from root", () => {
    const { nodes, edges } = IrToFlow(dummyIR, getId);
    const seqNodeId = nodes.find(
      (n) => n.data?.nodeData?.node_name === "Sequence"
    ).id;
    const childNodeId = nodes.find(
      (n) => n.data?.nodeData?.node_name === "AlwaysSuccess"
    ).id;

    // root edge
    expect(edges[0]).toEqual({
      id: "e-root-tree",
      source: "root",
      target: seqNodeId,
      style: { opacity: 0 },
    });
    // parent to child edge
    expect(edges).toContainEqual({
      id: `e-${seqNodeId}-${childNodeId}`,
      source: seqNodeId,
      target: childNodeId,
      deletable: true,
      style: { opacity: 0 },
    });
  });

  it("positions nodes based on depth and sibling index", () => {
    const { nodes } = IrToFlow(dummyIR, getId);
    const seqNode = nodes.find(
      (n) => n.data?.nodeData?.node_name === "Sequence"
    );
    const childNode = nodes.find(
      (n) => n.data?.nodeData?.node_name === "AlwaysSuccess"
    );

    expect(seqNode.position.y).toBe(1000 * 0); // depth 0
    expect(childNode.position.y).toBe(1000 * 1); // depth 1
  });

  it("handles multiple siblings, subtree nodes, and nodes without ports", () => {
    const irNodes = [
      {
        id: "n0",
        type: "SubTreeRoot",
        node_type: "NodeType.SUBTREE",
        ports: {},
        attributes: {},
        children: [
          {
            id: "n1",
            type: "Leaf1",
            node_type: "action",
            ports: {},
            attributes: {},
            children: [],
          },
          {
            id: "n2",
            type: "Leaf2",
            node_type: "action",
            ports: {},
            attributes: {},
            children: [],
          },
        ],
      },
    ];

    const { nodes, edges } = IrToFlow(irNodes, getId);

    // root node always first
    expect(nodes[0].id).toBe("root");

    // Subtree node type
    const subtreeNode = nodes.find(
      (n) => n.data?.nodeData?.node_name === "SubTreeRoot"
    );
    expect(subtreeNode.type).toBe("subtreeNode");

    // Sibling positions
    const leaf1 = nodes.find((n) => n.data?.nodeData?.node_name === "Leaf1");
    const leaf2 = nodes.find((n) => n.data?.nodeData?.node_name === "Leaf2");
    expect(leaf1.position.x).toBeLessThan(leaf2.position.x); // horizontally spaced
    expect(leaf1.position.y).toBe(1000); // depth = 1
    expect(leaf2.position.y).toBe(1000);

    // No ports should still be an empty array
    expect(subtreeNode.data.nodeData.input_ports).toEqual([]);
    expect(subtreeNode.data.nodeData.output_ports).toEqual([]);
    expect(subtreeNode.data.nodeData.input_output_ports).toEqual([]);

    // Edges: root -> subtree, subtree -> children
    expect(edges).toContainEqual({
      id: `e-root-tree`,
      source: "root",
      target: subtreeNode.id,
      style: { opacity: 0 },
    });
    expect(edges).toContainEqual({
      id: `e-${subtreeNode.id}-${leaf1.id}`,
      source: subtreeNode.id,
      target: leaf1.id,
      deletable: false,
      style: { opacity: 0 },
    });
    expect(edges).toContainEqual({
      id: `e-${subtreeNode.id}-${leaf2.id}`,
      source: subtreeNode.id,
      target: leaf2.id,
      deletable: false,
      style: { opacity: 0 },
    });
  });

  it("handles empty IR array", () => {
    const { nodes, edges } = IrToFlow([], getId);
    expect(nodes).toHaveLength(1); // root node only
    expect(edges).toHaveLength(0);
  });
});
