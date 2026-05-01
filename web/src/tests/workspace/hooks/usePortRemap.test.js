import { renderHook } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import usePortRemap from "../../../features/workspace/hooks/usePortRemap.js";

function createNode(id) {
  return {
    id,
    data: {
      nodeData: {
        remapped_ports: [
          { name: "testPort1", default: "1" },
          { name: "testPort2", default: "old" },
        ],
      },
    },
  };
}

describe("usePortRemap", () => {
  const getEdges = vi.fn(() => []);
  const onTreeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should update port name and value", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const { result } = renderHook(() =>
      usePortRemap(setNodes, getEdges, onTreeChange)
    );

    result.current.updatePort("n1", "testPort1", "newTestPort1", "2");
    const updatedPorts = currentNodes[0].data.nodeData.remapped_ports;

    expect(updatedPorts[0]).toStrictEqual({
      name: "newTestPort1",
      default: "2",
    });
    expect(updatedPorts[1]).toStrictEqual({
      name: "testPort2",
      default: "old",
    });

    expect(onTreeChange).toHaveBeenCalledWith(currentNodes, []);
  });

  test("should delete matching ports", () => {
    let currentNodes = [createNode("n1")];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const { result } = renderHook(() => usePortRemap(setNodes, getEdges, null));

    result.current.deletePort("n1", "testPort1");

    const updatedPorts = currentNodes[0].data.nodeData.remapped_ports;

    expect(updatedPorts.length).toBe(1);
    expect(updatedPorts[0]).toStrictEqual({
      name: "testPort2",
      default: "old",
    });
  });

  test("should not modify other nodes", () => {
    const node2 = createNode("n2");

    let currentNodes = [createNode("n1"), node2];

    const setNodes = (updater) => {
      currentNodes = updater(currentNodes);
    };

    const { result } = renderHook(() => usePortRemap(setNodes, getEdges, null));

    result.current.deletePort("n1", "testPort1");
    result.current.updatePort("n1", "testPort2", "testPort2", "updated");

    const updatedPorts = currentNodes[0].data.nodeData.remapped_ports;
    expect(updatedPorts.length).toBe(1);
    expect(updatedPorts[0]).toStrictEqual({
      name: "testPort2",
      default: "updated",
    });

    expect(currentNodes[1]).toBe(node2);
  });
});
