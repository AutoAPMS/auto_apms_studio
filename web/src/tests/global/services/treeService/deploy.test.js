import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../../../../store/treeStore.js";

beforeEach(() => {
  useStore.setState({
    savedJson: null,
    rootAttrs: null,
    trees: [],
    xmlDeclaration: null,
    selectedTree: null,
    selectedTreeId: null,
    entryTreeId: null,
    treeManifests: {},
    backendIp: "localhost",
    backendPort: "8000",
    backendHost: "http://localhost:8000",
  });
});

describe("treeStore", () => {
  it("should set savedJson", () => {
    const json = { root: "data" };
    useStore.getState().setSavedJson(json);
    expect(useStore.getState().savedJson).toEqual(json);
  });

  it("should set parsed data", () => {
    const data = {
      rootAttrs: { version: "1.0" },
      trees: [{ id: "tree-1" }],
      xmlDeclaration: { version: "1.0", encoding: "UTF-8" },
    };
    useStore.getState().setParsedData(data);
    const state = useStore.getState();
    expect(state.rootAttrs).toEqual(data.rootAttrs);
    expect(state.trees).toEqual(data.trees);
    expect(state.xmlDeclaration).toEqual(data.xmlDeclaration);
  });

  it("should set selected tree", () => {
    const tree = { id: "tree-1", name: "MyTree" };
    useStore.getState().setSelectedTree(tree, "tree-1");
    expect(useStore.getState().selectedTree).toEqual(tree);
    expect(useStore.getState().selectedTreeId).toBe("tree-1");
  });

  it("should set entryTreeId", () => {
    useStore.getState().setEntryTreeId("tree-42");
    expect(useStore.getState().entryTreeId).toBe("tree-42");
  });

  it("should set backend IP and update host", () => {
    useStore.getState().setBackendIp("192.168.1.1");
    const state = useStore.getState();
    expect(state.backendIp).toBe("192.168.1.1");
    expect(state.backendHost).toBe("http://192.168.1.1:8000");
  });

  it("should set backend port and update host", () => {
    useStore.getState().setBackendPort("9090");
    const state = useStore.getState();
    expect(state.backendPort).toBe("9090");
    expect(state.backendHost).toBe("http://localhost:9090");
  });

  it("should set tree manifest", () => {
    useStore.getState().setTreeManifest("tree-1", "manifest-abc");
    useStore.getState().setTreeManifest("tree-2", "manifest-xyz");
    const { treeManifests } = useStore.getState();
    expect(treeManifests["tree-1"]).toBe("manifest-abc");
    expect(treeManifests["tree-2"]).toBe("manifest-xyz");
  });
});
