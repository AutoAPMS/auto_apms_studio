import { describe, it, expect } from "vitest";
import {
  checkRefactor,
  deleteSubtreesInWorkspace,
  refactorTree,
  renameSubtreesInWorkspace,
} from "../../../features/sidebar/utils/treeRefactorUtils.js";

const testTree = {
  id: "TestTree",
  treeData: {
    BehaviorTree: {
      SubTree: [],
      ":@": { "@_ID": "Tree1" },
    },
  },
};
const testTree2 = {
  id: "TestTree",
  treeData: {
    BehaviorTree: {
      SubTree: [],
      ":@": { "@_ID": "Tree3" },
    },
  },
};

const createEdge = (source, target) => {
  return {
    id: `${source}-${target}`,
    source: source,
    target: target,
  };
};

const createNode = (id, isSubtree, subtreeId = "") => {
  return {
    id: id,
    type: isSubtree ? "subtreeNode" : "other",
    data: {
      nodeData: {
        subtreeId: subtreeId,
      },
    },
  };
};

describe("refactorTree", () => {
  it("should rename subtrees to new ID", () => {
    const { tree, refactored } = refactorTree(testTree, "Tree1", "Tree2");
    const expectedTree = {
      id: "TestTree",
      treeData: {
        BehaviorTree: {
          SubTree: [],
          ":@": { "@_ID": "Tree2" },
        },
      },
    };

    expect(refactored).toBeTruthy();
    expect(tree).toStrictEqual(expectedTree);
  });

  it("should delete subtree if new ID is null", () => {
    const { tree, refactored } = refactorTree(testTree, "Tree1", null);
    const expectedTree = {
      id: "TestTree",
      treeData: {
        BehaviorTree: {},
      },
    };

    expect(refactored).toBeTruthy();
    expect(tree).toStrictEqual(expectedTree);
  });

  it("should return original tree if no subtree matches ID", () => {
    const { tree, refactored } = refactorTree(testTree, "Tree999");

    expect(refactored).toBeFalsy();
    expect(tree).toStrictEqual(tree);
  });
});

describe("checkRefactor", () => {
  it("should return the IDs of all trees with matching subtrees", () => {
    const tree3 = { ...testTree, id: "TestTree3" };
    const result = checkRefactor([testTree, testTree2, tree3], "Tree1");

    expect(result.length).toBe(2);
    expect(result).toStrictEqual(["TestTree", "TestTree3"]);
  });
});

describe("renameSubtreesInWorkspace", () => {
  it("should rename subtrees to new ID", () => {
    const node1 = createNode("1", true, "Tree1");
    const node2 = createNode("1", false);

    const result = renameSubtreesInWorkspace([node1, node2], "Tree1", "Tree2");

    expect(result.length).toBe(2);
    expect(result[1]).toStrictEqual(node2);
    expect(result[0].data.nodeData.subtreeId).toStrictEqual("Tree2");
  });
});

describe("deleteSubtreesInWorkspace", () => {
  it("should delete the matching subtree and its children", () => {
    const n1 = createNode("1", false);
    const n2 = createNode("2", "subtreeNode", "Tree999");
    const n3 = createNode("3", "subtreeNode", "Tree1");
    const n4 = createNode("4", false);
    const n5 = createNode("5", false);

    const e1 = createEdge("1", "2");
    const e2 = createEdge("1", "3");
    const e3 = createEdge("3", "4");
    const e4 = createEdge("3", "5");

    const testNodes = [n1, n2, n3, n4, n5];
    const testEdges = [e1, e2, e3, e4];

    const { nodes, edges } = deleteSubtreesInWorkspace(
      testNodes,
      testEdges,
      "Tree1"
    );

    expect(nodes).toStrictEqual([n1, n2]);
    expect(edges).toStrictEqual([e1]);
  });
});
