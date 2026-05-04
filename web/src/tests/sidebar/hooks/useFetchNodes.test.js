import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFetchNodes } from "../../../features/sidebar/hooks/useFetchNodes.js";

vi.mock("../../../store/treeStore.js", () => ({
  useStore: vi.fn((selector) =>
    selector({ backendHost: "http://localhost:3000", nodeFetchTrigger: 0 })
  ),
}));

vi.stubGlobal("fetch", vi.fn());

describe("useFetchNodes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch nodes successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nodes: [{ id: "1", name: "Node1" }] }),
    });

    const { result } = renderHook(() => useFetchNodes());

    await waitFor(() => {
      expect(result.current.nodes).toEqual([{ id: "1", name: "Node1" }]);
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/node_modules/",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(result.current.error).toBeNull();
  });

  it("should set error and use fallback on non-ok backend response", async () => {
    fetch
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "2", name: "Fallback" }],
      });

    const { result } = renderHook(() => useFetchNodes());

    await waitFor(() => {
      expect(result.current.nodes).toEqual([{ id: "2", name: "Fallback" }]);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBe(
      "Network error: Failed to fetch node modules from backend. Using local fallback data."
    );
  });

  it("should use fallback data on network error", async () => {
    fetch
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "2", name: "Fallback" }],
      });

    const { result } = renderHook(() => useFetchNodes());

    await waitFor(() => {
      expect(result.current.nodes).toEqual([{ id: "2", name: "Fallback" }]);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3000/api/v1/node_modules/",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(fetch).toHaveBeenNthCalledWith(2, "/node_models.json");
    expect(result.current.error).toBe(
      "Network error: Failed to fetch node modules from backend. Using local fallback data."
    );
  });

  it("should handle fallback fetch error", async () => {
    fetch
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Fallback error"));

    const { result } = renderHook(() => useFetchNodes());

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Node Modules failed to load from backend and local fallback: Error: Fallback error"
      );
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.nodes).toEqual([]);
  });

  it("should set error when fallback returns non-ok status", async () => {
    fetch
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const { result } = renderHook(() => useFetchNodes());

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Node Modules fallback returned HTTP 404"
      );
    });

    expect(result.current.nodes).toEqual([]);
  });

  it("should cleanup on unmount", async () => {
    fetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ nodes: [{ id: "1", name: "Node1" }] }),
              }),
            100
          )
        )
    );

    const { result, unmount } = renderHook(() => useFetchNodes());

    unmount();

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(result.current.nodes).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
