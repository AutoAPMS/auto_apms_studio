import { describe, it, expect } from "vitest";
import { collisionUtils } from "../../../features/workspace/utils/collisionUtils.js";

describe("collisionUtils", () => {
  it("should return nodes unchanged when no collision", () => {
    const nodes = [
      { id: "1", position: { x: 0, y: 0 }, width: 100, height: 100 },
      { id: "2", position: { x: 200, y: 0 }, width: 100, height: 100 },
    ];

    const result = collisionUtils(nodes);

    expect(result).toEqual(nodes);
  });

  it("should adjust positions when nodes overlap", () => {
    const nodes = [
      { id: "1", position: { x: 0, y: 0 }, width: 100, height: 100 },
      { id: "2", position: { x: 50, y: 0 }, width: 100, height: 100 },
    ];

    const result = collisionUtils(nodes);

    expect(result[0].position.x).toBeLessThan(0);
    expect(result[1].position.x).toBeGreaterThan(50);
  });

  it("should handle nodes with measured dimensions", () => {
    const nodes = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 100 },
      },
    ];

    const result = collisionUtils(nodes);

    expect(result[0].id).toBe("1");
  });

  it("should handle hidden nodes", () => {
    const nodes = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 100 },
        hidden: true,
      },
    ];

    const result = collisionUtils(nodes);

    expect(result[0].id).toBe("1");
  });
});
