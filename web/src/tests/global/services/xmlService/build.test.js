import { describe, it, expect } from "vitest";
import {
  buildJsonToXml,
  parseXmlToJson,
} from "../../../../services/xmlService.js";

const sampleXml1 = `<?xml version="1.0" encoding="UTF-8"?>
<root BTCPP_format="4"
      main_tree_to_execute="ParentIncludeChildIncludeParent">
  <include path="child/child_include_parent.xml"/>
  <BehaviorTree ID="ParentIncludeChildIncludeParent">
    <Sequence>
      <SubTree ID="ChildIncludeParent" _autoremap="true"/>
      <AlwaysSuccess/>
    </Sequence>
  </BehaviorTree>
</root>`;

const sampleXml2 = `<?xml version="1.0" encoding="UTF-8"?>
<root BTCPP_format="4">
  <BehaviorTree ID="SimpleTree">
    <Sequence _description="A Sequence will execute its children in a specific order:&#10;- From left to righ (vertical tree layout) or&#10;- Top to bottom (horizontal tree layout)&#10;If a child returns FAILURE, the Sequence stops and returns FAILURE.">
      <CheckBattery/>
      <OpenGripper/>
      <ApproachObject/>
      <CloseGripper/>
    </Sequence>
  </BehaviorTree>
</root>`;

describe("XML Service - buildJsonToXml", () => {
  it("builds XML from first sample JSON and contains Sequence", () => {
    const json = parseXmlToJson(sampleXml1);
    const xml = buildJsonToXml(json);

    expect(xml).toContain("<BehaviorTree");
    expect(xml).toContain("<Sequence");
    expect(xml).toContain("ParentIncludeChildIncludeParent");
  });

  it("builds XML from second sample JSON and contains all sequence children", () => {
    const json = parseXmlToJson(sampleXml2);
    const xml = buildJsonToXml(json);

    expect(xml).toContain("<CheckBattery");
    expect(xml).toContain("<OpenGripper");
    expect(xml).toContain("<ApproachObject");
    expect(xml).toContain("<CloseGripper");
  });

  it("round-trip parse/build preserves structure", () => {
    const json = parseXmlToJson(sampleXml1);
    const xml = buildJsonToXml(json);
    const jsonAgain = parseXmlToJson(xml);

    expect(jsonAgain).toEqual(json);
  });
});
