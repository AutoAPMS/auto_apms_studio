import { describe, it, expect } from "vitest";
import {
  filterBySearch,
  getUniqueValues,
} from "../../../features/sidebar/utils/searchUtils.js";

describe("filterBySearch", () => {
  it("should return items if no searchText parameter value is provided", () => {
    const items = [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ];
    const result = filterBySearch(items, "", "name");
    expect(result).toEqual(items);
  });

  it("should return items that match the searchText parameter value", () => {
    const items = [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
      { id: "3", name: "Another Item" },
    ];
    const result = filterBySearch(items, "Ano", "name");
    expect(result).toEqual([{ id: "3", name: "Another Item" }]);
  });
});

describe("getUniqueValues", () => {
  it("should return unique values from the specified key in the items array", () => {
    const items = [
      { id: "1", category: "A" },
      { id: "2", category: "B" },
      { id: "3", category: "A" },
      { id: "4", category: "C" },
    ];
    const result = getUniqueValues(items, "category");
    expect(result).toEqual(["A", "B", "C"]);
  });
});
