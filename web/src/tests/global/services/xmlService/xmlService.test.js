import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

import {
  parseXmlToJson,
  buildJsonToXml,
} from "../../../../services/xmlService.js";

const xmlPath = resolve("src/tests/samples/sample.xml");
const jsonPath = resolve("src/tests/samples/sample.json");

describe("XML Service (fixtures)", () => {
  const xmlText = readFileSync(xmlPath, "utf-8");
  const expectedJson = JSON.parse(readFileSync(jsonPath, "utf-8"));

  it("parses XML into expected JSON", () => {
    const result = parseXmlToJson(xmlText);
    expect(result).toEqual(expectedJson);
  });

  it("builds XML from JSON", () => {
    const xml = buildJsonToXml(expectedJson);
    expect(xml).toContain("<BehaviorTree");
    expect(xml).toContain("<AlwaysSuccess");
    expect(xml).toContain('ID="Untitled"');
  });

  it("round-trip conversion is stable", () => {
    const json = parseXmlToJson(xmlText);
    const xml = buildJsonToXml(json);
    const jsonAgain = parseXmlToJson(xml);

    expect(jsonAgain).toEqual(json);
  });
});
