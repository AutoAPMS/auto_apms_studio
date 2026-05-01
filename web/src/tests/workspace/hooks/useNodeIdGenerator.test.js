import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useNodeIdGenerator from "../../../features/workspace/hooks/useNodeIdGenerator.js";

describe("useNodeIdGenerator", () => {
  it("should generate unique IDs", () => {
    const { result } = renderHook(() => useNodeIdGenerator("test"));

    const id1 = result.current.getNodeId();
    const id2 = result.current.getNodeId();

    expect(id1).toBe("test-0");
    expect(id2).toBe("test-1");
  });

  it("should return the id that was set", () => {
    const { result } = renderHook(() => useNodeIdGenerator("test"));

    const id1 = result.current.getNodeId();
    expect(id1).toBe("test-0");

    result.current.setNodeId(10);

    const id2 = result.current.getNodeId();
    expect(id2).toBe("test-10");
  });

  it("should handle null tree Ids", () => {
    const { result } = renderHook(() => useNodeIdGenerator(null));

    const id1 = result.current.getNodeId();
    expect(id1).toBe("n-0");
  });
});
