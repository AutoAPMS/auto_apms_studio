import { describe, it, expect } from "vitest";
import { parseXmlToJson } from "../../../../services/xmlService.js";

const sampleXml1 = `<?xml version="1.0" encoding="UTF-8"?>
<root BTCPP_format="4"
      main_tree_to_execute="ParentIncludeChildIncludeParent">
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

describe("XML Service - parseXmlToJson", () => {
  it("parses first sample XML with include and subtree", () => {
    const result = parseXmlToJson(sampleXml1);

    expect(result).toBeDefined();

    const root = result.find((obj) => obj.root);
    expect(root).toBeDefined();

    const behaviorTree = root.root[0].BehaviorTree[0];
    expect(behaviorTree).toHaveProperty("Sequence");
  });

  it("parses second sample XML with multiple sequence children", () => {
    const result = parseXmlToJson(sampleXml2);

    const root = result.find((obj) => obj.root);
    const behaviorTree = root.root[0].BehaviorTree[0];
    const sequence = behaviorTree.Sequence; // this is an array

    const childTags = sequence.map((child) => Object.keys(child)[0]);
    // ["CheckBattery", "OpenGripper", "ApproachObject", "CloseGripper"]

    expect(childTags).toContain("CheckBattery");
    expect(childTags).toContain("OpenGripper");
    expect(childTags).toContain("ApproachObject");
    expect(childTags).toContain("CloseGripper");
  });
});
