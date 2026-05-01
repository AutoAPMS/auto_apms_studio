import { describe, it, expect } from "vitest";
import {
  parseXmlToJson,
  wrapTreeInRoot,
} from "../../../../services/xmlService.js";

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<root BTCPP_format="4">
  <BehaviorTree ID="SimpleTree">
    <Sequence>
      <CheckBattery/>
      <OpenGripper/>
    </Sequence>
  </BehaviorTree>
</root>`;

describe("XML Service - wrapTreeInRoot", () => {
  const treeJson = parseXmlToJson(sampleXml)[1].root[0];

  it("returns null if tree is null", () => {
    expect(wrapTreeInRoot(null, "id", {}, null)).toBeNull();
  });

  it("wraps tree correctly with XML declaration", () => {
    const xmlDeclaration = { "?xml": { version: "1.0", encoding: "UTF-8" } };
    const rootAttrs = { attr1: "value1" };
    const result = wrapTreeInRoot(
      treeJson,
      "tree-1",
      rootAttrs,
      xmlDeclaration
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(xmlDeclaration);
    expect(result[1].root[0][":@"]["@_ID"]).toBe("tree-1");
    expect(result[1][":@"]).toEqual(rootAttrs);
  });

  it("wraps tree correctly without XML declaration", () => {
    const rootAttrs = { attr1: "value1" };
    const result = wrapTreeInRoot(treeJson, "tree-2", rootAttrs, null);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({});
    expect(result[1].root[0][":@"]["@_ID"]).toBe("tree-2");
  });
});
