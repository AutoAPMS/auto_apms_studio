import { describe, it, expect } from "vitest";
import {
  isRoot,
  isRootOrDecorator,
  isSubtree,
} from "../../../features/workspace/utils/nodeHelpers.js";

describe("isRootOrDecorator", () => {
  it("should return false if node type is not decorator", () => {
    const node = { id: "1", name: "Node 1" };
    const result = isRootOrDecorator(node);
    expect(result).toBe(false);
  });

  it("should return true if node type is decorator", () => {
    const node = {
      id: "2",
      data: {
        nodeData: {
          node_type: "NodeType.DECORATOR",
        },
      },
    };
    const result = isRootOrDecorator(node);
    expect(result).toBe(true);
  });
});

describe("isRoot", () => {
  it("should return false if node is not root", () => {
    const node = { id: "1" };
    const result = isRoot(node);
    expect(result).toBe(false);
  });

  it("should return true if node is root", () => {
    const node = {
      id: "1",
      type: "rootNode",
    };
    const result = isRoot(node);
    expect(result).toBe(true);
  });
});

describe("isSubtree", () => {
  it("should return false if node is not a subtree node", () => {
    const node = { id: "1" };
    const result = isSubtree(node);
    expect(result).toBe(false);
  });

  it("should return true if node is a subtree node", () => {
    const node = {
      id: "1",
      type: "subtreeNode",
    };
    const result = isSubtree(node);
    expect(result).toBe(true);
  });
});
