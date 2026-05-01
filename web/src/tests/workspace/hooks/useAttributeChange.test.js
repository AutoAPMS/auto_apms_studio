import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import useAttributeChange from "../../../features/workspace/hooks/useAttributeChange";

describe("useAttributeChange", () => {
  test("updates attribute value for the correct node and triggers onTreeChange", () => {
    const mockNodes = [
      {
        id: "n1",
        data: {
          nodeData: {
            attributes: {
              speed: 1,
            },
          },
        },
      },
      {
        id: "n2",
        data: {
          nodeData: {
            attributes: {
              speed: 2,
            },
          },
        },
      },
    ];

    let currentNodes = mockNodes;

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => ["edge1"]);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      useAttributeChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("n1", "speed", 10);
    });

    // ✅ Node n1 updated
    expect(currentNodes[0].data.nodeData.attributes.speed).toBe(10);

    // ✅ Other node unchanged
    expect(currentNodes[1].data.nodeData.attributes.speed).toBe(2);

    // ✅ onTreeChange called correctly
    expect(onTreeChange).toHaveBeenCalledWith(currentNodes, ["edge1"]);
  });

  test("does nothing if nodeId is not found", () => {
    const mockNodes = [
      {
        id: "n1",
        data: {
          nodeData: {
            attributes: { speed: 1 },
          },
        },
      },
    ];

    let currentNodes = mockNodes;

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      useAttributeChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("unknown", "speed", 10);
    });

    // ✅ No change
    expect(currentNodes[0].data.nodeData.attributes.speed).toBe(1);

    // onTreeChange still called because setNodes ran
    expect(onTreeChange).toHaveBeenCalled();
  });
});
