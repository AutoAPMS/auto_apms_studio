import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNodeFilter } from "../../../features/sidebar/hooks/useNodeFilter.js";

describe("useNodeFilter", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useNodeFilter([]));

    expect(result.current.sortType).toBe("Package");
    expect(result.current.selectedPackages).toEqual([]);
    expect(result.current.searchText).toBe("");
    expect(result.current.allPackages).toEqual([]);
  });

  it("should extract unique packages from nodes", () => {
    const nodes = [
      { package: "pkg1" },
      { package: "pkg2" },
      { package: "pkg1" },
    ];

    const { result } = renderHook(() => useNodeFilter(nodes));

    expect(result.current.allPackages).toEqual(["pkg1", "pkg2"]);
    expect(result.current.selectedPackages).toEqual(["pkg1", "pkg2"]);
  });

  it("should update sortType", () => {
    const { result } = renderHook(() => useNodeFilter([]));

    act(() => {
      result.current.setSortType("NodeType");
    });

    expect(result.current.sortType).toBe("NodeType");
  });

  it("should update selectedPackages", () => {
    const { result } = renderHook(() => useNodeFilter([]));

    act(() => {
      result.current.setSelectedPackages(["pkg1"]);
    });

    expect(result.current.selectedPackages).toEqual(["pkg1"]);
  });

  it("should update searchText", () => {
    const { result } = renderHook(() => useNodeFilter([]));

    act(() => {
      result.current.setSearchText("test");
    });

    expect(result.current.searchText).toBe("test");
  });
});
