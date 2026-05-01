import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import usePortChange from "../../../features/workspace/hooks/usePortChange";

function createNode(id) {
  return {
    id,
    data: {
      nodeData: {
        input_ports: [
          { name: "in1", default: 1 },
          { name: "shared", default: "old" },
        ],
        output_ports: [
          { name: "out1", default: 2 },
          { name: "shared", default: "old" },
        ],
        input_output_ports: [{ name: "inout1", default: 3 }],
      },
    },
  };
}

describe("usePortChange", () => {
  test("updates input port value correctly", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      usePortChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("n1", "in1", 42);
    });

    expect(currentNodes[0].data.nodeData.input_ports[0].default).toBe(42);

    expect(onTreeChange).toHaveBeenCalledWith(currentNodes, []);
  });

  test("updates output port value correctly", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      usePortChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("n1", "out1", 99);
    });

    expect(currentNodes[0].data.nodeData.output_ports[0].default).toBe(99);
  });

  test("updates input_output port value correctly", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      usePortChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("n1", "inout1", 123);
    });

    expect(currentNodes[0].data.nodeData.input_output_ports[0].default).toBe(
      123
    );
  });

  test("updates all matching ports with same name", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      usePortChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("n1", "shared", "newValue");
    });

    expect(currentNodes[0].data.nodeData.input_ports[1].default).toBe(
      "newValue"
    );

    expect(currentNodes[0].data.nodeData.output_ports[1].default).toBe(
      "newValue"
    );
  });

  test("does nothing if node not found", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      usePortChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("unknown", "in1", 500);
    });

    // unchanged
    expect(currentNodes[0].data.nodeData.input_ports[0].default).toBe(1);

    expect(onTreeChange).toHaveBeenCalled();
  });

  test("handles nodes with undefined or empty port arrays", () => {
    const nodeWithMissingPorts = {
      id: "n2",
      data: {
        nodeData: {
          // input_ports is undefined
          output_ports: null, // explicitly null
          input_output_ports: [], // empty array
        },
      },
    };

    let currentNodes = [nodeWithMissingPorts];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      usePortChange(setNodes, getEdges, onTreeChange)
    );

    // Should not crash when port arrays are missing
    act(() => {
      result.current("n2", "anyPort", "value");
    });

    const nodeData = currentNodes[0].data.nodeData;

    // Verify fallback to empty arrays
    expect(nodeData.input_ports).toEqual([]);
    expect(nodeData.output_ports).toEqual([]);
    expect(nodeData.input_output_ports).toEqual([]);
    expect(onTreeChange).toHaveBeenCalledWith(currentNodes, []);
  });

  test("does not call onTreeChange if callback is null", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);

    const { result } = renderHook(
      () => usePortChange(setNodes, getEdges, null) // onTreeChange is null
    );

    // Should not crash
    act(() => {
      result.current("n1", "in1", 42);
    });

    expect(currentNodes[0].data.nodeData.input_ports[0].default).toBe(42);
    expect(getEdges).not.toHaveBeenCalled(); // Should not be called if onTreeChange is null
  });

  test("leaves non-matching ports unchanged", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const getEdges = vi.fn(() => []);
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      usePortChange(setNodes, getEdges, onTreeChange)
    );

    act(() => {
      result.current("n1", "in1", "changed");
    });

    // in1 should be changed
    expect(currentNodes[0].data.nodeData.input_ports[0].default).toBe(
      "changed"
    );

    // shared should be unchanged (lines 33-43 skip non-matching ports)
    expect(currentNodes[0].data.nodeData.input_ports[1].default).toBe("old");
    expect(currentNodes[0].data.nodeData.output_ports[1].default).toBe("old");
  });
});
