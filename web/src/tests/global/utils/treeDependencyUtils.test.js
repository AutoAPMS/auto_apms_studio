import { describe, expect, it } from "vitest";
import {
  checkCircularDependencies,
  collectSubtreeDependencies,
} from "../../../utils/treeDependencyUtils.js";

describe("checkCircularDependencies", () => {
  const createTree = (id, subtreeId) => ({
    id: id,
    treeData: {
      BehaviorTree: {
        SubTree: [],
        ":@": { "@_ID": subtreeId },
      },
    },
  });

  const createTreeWithoutSubtree = (id) => ({
    id: id,
    treeData: {
      BehaviorTree: {
        Action: [],
      },
    },
  });

  it("should detect if trees are part of a circular dependency or not", () => {
    const tree1 = createTree("Tree1", "Tree2");
    const tree2 = createTree("Tree2", "Tree1");
    const tree3 = createTree("Tree3", "Tree4");
    const tree4 = createTreeWithoutSubtree("Tree4");

    const treesToCheck = [tree1, tree2, tree3];
    const trees = [tree1, tree2, tree3, tree4];
    const initialDeps = [];

    const result = checkCircularDependencies(treesToCheck, trees, initialDeps);

    expect(result.size).toBe(3);
    expect(result.get(tree1.id)).toBe(true);
    expect(result.get(tree2.id)).toBe(true);
    expect(result.get(tree3.id)).toBe(false);
  });

  it("should handle subtrees that do not exist", () => {
    const tree3 = createTree("Tree3", "Tree4");

    const treesToCheck = [tree3];
    const trees = [tree3];
    const initialDeps = [];

    const result = checkCircularDependencies(treesToCheck, trees, initialDeps);

    expect(result.size).toBe(1);
    expect(result.get(tree3.id)).toBe(false);
  });
});

describe("collectSubtreeDependencies", () => {
  it("should return all direct dependencies", () => {
    const treeData = {
      BehaviorTree: [
        {
          Sequence: [
            { SubTree: [], ":@": { "@_ID": "Tree1" } },
            { SubTree: [], ":@": { "@_ID": "Tree2" } },
            { SubTree: [], ":@": { "@_ID": "Tree3" } },
          ],
        },
      ],
    };

    const result = collectSubtreeDependencies(treeData);

    expect(result.size).toBe(3);
    expect(result).toStrictEqual(new Set(["Tree1", "Tree2", "Tree3"]));
  });

  it("should handle subtrees without ID", () => {
    const treeData = {
      BehaviorTree: [{ SubTree: [], ":@": {} }],
    };

    const result = collectSubtreeDependencies(treeData);

    expect(result.size).toBe(0);
  });

  it("should handle undefined nodes", () => {
    const treeData = {
      BehaviorTree: [0],
    };

    const result = collectSubtreeDependencies(treeData);

    expect(result.size).toBe(0);
  });
});
