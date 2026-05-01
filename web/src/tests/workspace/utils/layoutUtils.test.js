import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createLayer,
  createLayerAfterLast,
  getNearestLayer,
  removeUnusedLayers,
  snapNodesToLayer,
  snapPositionToLayer,
  sortNodesByLayer,
} from "../../../features/workspace/utils/layoutUtils.js";

const { mockedIsRoot } = vi.hoisted(() => {
  return { mockedIsRoot: vi.fn() };
});

vi.mock("../../../features/workspace/utils/nodeHelpers.js", () => ({
  isRoot: mockedIsRoot,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mockedIsRoot.mockReturnValue(false);
});

describe("getNearestLayer", () => {
  it("should return the index of the nearest layer", () => {
    const layers = [0, 100, 200];
    const position = { y: 50 };

    const result = getNearestLayer(position, layers);

    expect(result).toBe(0);
  });

  it("should return correct index for middle layer", () => {
    const layers = [0, 100, 200];
    const position = { y: 120 };

    const result = getNearestLayer(position, layers);

    expect(result).toBe(1);
  });
});

describe("snapPositionToLayer", () => {
  it("should snap position to the nearest layer", () => {
    const layers = [0, 100, 200];
    const position = { y: 50, x: 10 };

    const result = snapPositionToLayer(position, layers);

    expect(result).toStrictEqual({
      layer: 0,
      position: {
        x: 10,
        y: 0,
      },
    });
  });
});

describe("snapNodesToLayer", () => {
  it("should snap and move all nodes by the minimal amount of layers", () => {
    const layers = [0, 100, 200];
    const node = {
      position: { y: 200, x: 10 },
      data: { layer: 0 },
    };
    const node2 = {
      position: { y: 80, x: 10 },
      data: { layer: 0 },
    };
    const node3 = {
      position: { y: 200, x: 10 },
      data: { layer: 1 },
    };
    const nodes = [node, node2, node3];

    const result = snapNodesToLayer(nodes, layers);

    expect(result).toStrictEqual([
      {
        position: {
          x: 10,
          y: 100,
        },
        data: { layer: 1 },
      },
      {
        position: {
          x: 10,
          y: 100,
        },
        data: { layer: 1 },
      },
      {
        position: {
          x: 10,
          y: 200,
        },
        data: { layer: 2 },
      },
    ]);
  });
});

describe("createLayerAfterLast", () => {
  it("should create a new layer after the last one", () => {
    const layers = [0];
    const node = {
      id: "1",
      position: { y: 50, x: 0 },
      data: { layer: 0 },
      measured: { width: 100, height: 50 },
    };
    const nodes = [node];
    const options = {
      "elk.layered.spacing.nodeNodeBetweenLayers": 50,
    };

    const result = createLayerAfterLast(layers, nodes, options);

    expect(result).toStrictEqual([0, 100]);
  });

  it("should return original layers if no node on last layer", () => {
    const layers = [0, 100];
    const node = {
      id: "1",
      position: { y: 0, x: 0 },
      data: { layer: 0 },
      measured: { width: 100, height: 50 },
    };
    const nodes = [node];
    const options = {
      "elk.layered.spacing.nodeNodeBetweenLayers": 50,
    };

    const result = createLayerAfterLast(layers, nodes, options);

    expect(result).toStrictEqual([0, 100]);
  });

  it("should ignore the root node", () => {
    mockedIsRoot.mockReturnValue(true);
    const layers = [0];
    const node = {
      id: "1",
      position: { y: 50, x: 0 },
      data: { layer: 0 },
      measured: { width: 100, height: 50 },
    };
    const nodes = [node];
    const options = {};

    const result = createLayerAfterLast(layers, nodes, options);

    expect(result).toStrictEqual([0]);
  });
});

describe("createLayer", () => {
  it("should return a new layer after the given position", () => {
    const position = 50;
    const minDistance = 50;
    const options = {
      "elk.layered.spacing.nodeNodeBetweenLayers": 50,
    };

    const result = createLayer(position, minDistance, options);

    expect(result).toBeGreaterThanOrEqual(position + minDistance);
  });
});

describe("removeUnusedLayers", () => {
  it("should remove layers that have no nodes", () => {
    const layers = [0, 100, 150];
    const node = {
      id: "1",
      position: { y: 50, x: 0 },
      data: { layer: 0 },
      measured: { width: 100, height: 50 },
    };
    const nodes = [node];

    const result = removeUnusedLayers(nodes, layers);

    expect(result).toStrictEqual([0, 100]);
  });
  it("should ignore the root node", () => {
    mockedIsRoot.mockReturnValue(true);
    const layers = [0, 100, 150];
    const node = {
      id: "1",
      position: { y: 50, x: 0 },
      data: { layer: 0 },
      measured: { width: 100, height: 50 },
    };
    const nodes = [node];

    const result = removeUnusedLayers(nodes, layers);

    expect(result).toStrictEqual([0]);
  });
});

describe("sortNodesByLayer", () => {
  it("should group nodes by their layer", () => {
    const nodes = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        width: 100,
        height: 100,
        data: { layer: 0 },
      },
      {
        id: "2",
        position: { x: 50, y: 0 },
        width: 100,
        height: 100,
        data: { layer: 0 },
      },
      {
        id: "3",
        position: { x: 0, y: 100 },
        width: 100,
        height: 100,
        data: { layer: 1 },
      },
    ];
    const layers = [0, 100];

    const result = sortNodesByLayer(nodes, layers);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].id).toBe("1");
    expect(result[0][1].id).toBe("2");
    expect(result[1]).toHaveLength(1);
    expect(result[1][0].id).toBe("3");
  });
  it("should ignore the root node", () => {
    mockedIsRoot.mockReturnValue(true);
    const nodes = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        width: 100,
        height: 100,
        data: { layer: 0 },
      },
    ];
    const layers = [0, 100];

    const result = sortNodesByLayer(nodes, layers);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(0);
    expect(result[1]).toHaveLength(0);
  });
});
