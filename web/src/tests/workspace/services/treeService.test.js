import { describe, it, expect, vi } from "vitest";
import {
  getNodesBetweenLayers,
  getNodesInOrder,
} from "../../../features/workspace/services/treeService.js";

vi.mock("@xyflow/react", () => ({
  getIncomers: vi.fn(),
  getOutgoers: vi.fn(),
}));

import { getIncomers, getOutgoers } from "@xyflow/react";

describe("getNodesInOrder", () => {
  it("should return nodes in order", () => {
    const nodes = [
      { id: "1", position: { x: 0, y: 0 }, data: { layer: 0 } },
      { id: "2", position: { x: 0, y: 100 }, data: { layer: 1 } },
      { id: "3", position: { x: 100, y: 100 }, data: { layer: 1 } },
    ];

    const edges = [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e1-3", source: "1", target: "3" },
    ];

    getIncomers.mockImplementation((node) => {
      if (node.id === "1") return [];
      return [nodes[0]];
    });

    getOutgoers.mockImplementation((node) => {
      if (node.id === "1") return [nodes[1], nodes[2]];
      return [];
    });

    const result = getNodesInOrder(nodes, edges);

    expect(result).toEqual([
      { id: "1", position: { x: 0, y: 0 }, data: { layer: 0 } },
      { id: "2", position: { x: 0, y: 100 }, data: { layer: 1 } },
      { id: "3", position: { x: 100, y: 100 }, data: { layer: 1 } },
    ]);
  });

  it("should handle single node with no edges", () => {
    const nodes = [{ id: "1", position: { x: 0, y: 0 } }];

    const edges = [];

    getIncomers.mockReturnValue([]);
    getOutgoers.mockReturnValue([]);

    const result = getNodesInOrder(nodes, edges);

    expect(result).toEqual([nodes[0]]);
  });

  it("should handle empty nodes array", () => {
    const result = getNodesInOrder([], []);

    expect(result).toEqual([]);
  });
});

describe("getNodesBetweenLayers", () => {
  it("should return nodes between specified layers", () => {
    const nodes = [
      { id: "1", data: { layer: 0 } },
      { id: "2", data: { layer: 1 } },
      { id: "3", data: { layer: 2 } },
      { id: "4", data: { layer: 3 } },
      { id: "5", data: { layer: 4 } },
    ];

    const result = getNodesBetweenLayers(nodes, { min: 1, max: 3 });

    expect(result).toEqual([
      { id: "2", data: { layer: 1 } },
      { id: "3", data: { layer: 2 } },
      { id: "4", data: { layer: 3 } },
    ]);
  });

  it("should return empty array if no nodes in range", () => {
    const nodes = [
      { id: "1", data: { layer: 0 } },
      { id: "2", data: { layer: 1 } },
    ];

    const result = getNodesBetweenLayers(nodes, { min: 5, max: 10 });

    expect(result).toEqual([]);
  });

  it("should handle single layer range", () => {
    const nodes = [
      { id: "1", data: { layer: 0 } },
      { id: "2", data: { layer: 1 } },
      { id: "3", data: { layer: 2 } },
    ];

    const result = getNodesBetweenLayers(nodes, { min: 1, max: 1 });

    expect(result).toEqual([{ id: "2", data: { layer: 1 } }]);
  });

  it("should include boundary values (min and max)", () => {
    const nodes = [
      { id: "1", data: { layer: 0 } },
      { id: "2", data: { layer: 1 } },
      { id: "3", data: { layer: 2 } },
      { id: "4", data: { layer: 3 } },
    ];

    const result = getNodesBetweenLayers(nodes, { min: 1, max: 2 });

    expect(result).toEqual([
      { id: "2", data: { layer: 1 } },
      { id: "3", data: { layer: 2 } },
    ]);
  });

  it("should handle empty nodes array", () => {
    const result = getNodesBetweenLayers([], { min: 0, max: 5 });

    expect(result).toEqual([]);
  });
});
