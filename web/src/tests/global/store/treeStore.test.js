import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ─── Session-storage mock ────────────────────────────────────────────────────

function makeStorageMock() {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    /** Helper – parse the persisted JSON blob written by zustand/persist. */
    getParsed: (key) => JSON.parse(store[key] ?? "null"),
  };
}

// ─── Store factory ───────────────────────────────────────────────────────────
// Re-create the store for every test so each test gets a clean slate,
// including a fresh persist middleware with the new sessionStorage mock.

let storageMock;

async function freshStore() {
  // Wipe the module registry so `create` / persist re-run from scratch.
  vi.resetModules();
  const { useStore } = await import("../../../store/treeStore.js");
  return useStore;
}

// ─── Shared setup ────────────────────────────────────────────────────────────

beforeEach(() => {
  storageMock = makeStorageMock();

  Object.defineProperty(globalThis, "sessionStorage", {
    value: storageMock,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("treeStore – initial state", () => {
  it("has the correct default values", async () => {
    const useStore = await freshStore();
    const s = useStore.getState();

    expect(s.savedJson).toBeNull();
    expect(s.rootAttrs).toBeNull();
    expect(s.trees).toEqual([]);
    expect(s.xmlDeclaration).toBeNull();
    expect(s.selectedTree).toBeNull();
    expect(s.backendIp).toBe("localhost");
    expect(s.backendPort).toBe("8000");
    expect(s.backendHost).toBe("http://localhost:8000");
  });
});

// ─── setSavedJson ─────────────────────────────────────────────────────────────

describe("treeStore – setSavedJson", () => {
  it("stores a json object", async () => {
    const useStore = await freshStore();
    useStore.getState().setSavedJson({ foo: "bar" });

    expect(useStore.getState().savedJson).toEqual({ foo: "bar" });
  });

  it("accepts null to clear json", async () => {
    const useStore = await freshStore();
    useStore.getState().setSavedJson({ foo: "bar" });
    useStore.getState().setSavedJson(null);

    expect(useStore.getState().savedJson).toBeNull();
  });
});

// ─── setParsedData ────────────────────────────────────────────────────────────

describe("treeStore – setParsedData", () => {
  it("stores all three fields", async () => {
    const useStore = await freshStore();
    useStore.getState().setParsedData({
      rootAttrs: { main_tree_to_execute: "BT" },
      trees: [{ id: "t1" }, { id: "t2" }],
      xmlDeclaration: { version: "1.0" },
    });

    const s = useStore.getState();
    expect(s.rootAttrs).toEqual({ main_tree_to_execute: "BT" });
    expect(s.trees).toHaveLength(2);
    expect(s.xmlDeclaration).toEqual({ version: "1.0" });
  });

  it("replaces previous parsed data", async () => {
    const useStore = await freshStore();
    useStore.getState().setParsedData({
      rootAttrs: { old: true },
      trees: [{ id: "old" }],
      xmlDeclaration: { version: "1.0" },
    });
    useStore.getState().setParsedData({
      rootAttrs: { new: true },
      trees: [],
      xmlDeclaration: null,
    });

    const s = useStore.getState();
    expect(s.rootAttrs).toEqual({ new: true });
    expect(s.trees).toHaveLength(0);
    expect(s.xmlDeclaration).toBeNull();
  });
});

// ─── setSelectedTree ──────────────────────────────────────────────────────────

describe("treeStore – setSelectedTree", () => {
  it("stores a tree object", async () => {
    const useStore = await freshStore();
    useStore.getState().setSelectedTree({ id: "tree1", name: "Root" });

    expect(useStore.getState().selectedTree).toEqual({
      id: "tree1",
      name: "Root",
    });
  });
});

// ─── backendHost ─────────────────────────────────────────────────────────────

describe("treeStore – BackendHost", () => {
  it("updates backendIp and recalculates backendHost", async () => {
    const useStore = await freshStore();
    useStore.getState().setBackendIp("192.168.1.1");

    const s = useStore.getState();
    expect(s.backendIp).toBe("192.168.1.1");
    expect(s.backendPort).toBe("8000"); // unchanged
    expect(s.backendHost).toBe("http://192.168.1.1:8000");
  });

  it("updates backendPort and recalculates backendHost", async () => {
    const useStore = await freshStore();
    useStore.getState().setBackendPort("3000");

    const s = useStore.getState();
    expect(s.backendPort).toBe("3000");
    expect(s.backendIp).toBe("localhost"); // unchanged
    expect(s.backendHost).toBe("http://localhost:3000");
  });

  it("combined ip+port change produces correct host", async () => {
    const useStore = await freshStore();
    useStore.getState().setBackendIp("10.0.0.1");
    useStore.getState().setBackendPort("9000");

    expect(useStore.getState().backendHost).toBe("http://10.0.0.1:9000");
  });
});

// ─── Persistence (partialize) ─────────────────────────────────────────────────

describe("treeStore – persistence", () => {
  it("persists savedJson, backendIp, and backendPort to sessionStorage", async () => {
    const useStore = await freshStore();
    useStore.getState().setSavedJson({ persisted: true });
    useStore.getState().setBackendIp("1.2.3.4");
    useStore.getState().setBackendPort("5678");

    const blob = storageMock.getParsed("behavior-tree-storage");
    expect(blob.state.savedJson).toEqual({ persisted: true });
    expect(blob.state.backendIp).toBe("1.2.3.4");
    expect(blob.state.backendPort).toBe("5678");
  });
});

// ─── onRehydrateStorage ───────────────────────────────────────────────────────

describe("treeStore – rehydration", () => {
  it("reconstructs backendHost from persisted ip and port on load", async () => {
    // Seed storage before the store is created for the first time.
    storageMock.setItem(
      "behavior-tree-storage",
      JSON.stringify({
        state: { savedJson: null, backendIp: "10.0.0.5", backendPort: "4321" },
        version: 0,
      })
    );

    const useStore = await freshStore();
    const s = useStore.getState();

    expect(s.backendIp).toBe("10.0.0.5");
    expect(s.backendPort).toBe("4321");
    expect(s.backendHost).toBe("http://10.0.0.5:4321");
  });

  it("restores savedJson from sessionStorage", async () => {
    storageMock.setItem(
      "behavior-tree-storage",
      JSON.stringify({
        state: {
          savedJson: { restored: true },
          backendIp: "localhost",
          backendPort: "8000",
        },
        version: 0,
      })
    );

    const useStore = await freshStore();

    expect(useStore.getState().savedJson).toEqual({ restored: true });
  });

  it("does not throw when storage contains malformed JSON (state is null branch)", async () => {
    storageMock.setItem("behavior-tree-storage", "not-valid-json{{{");

    const useStore = await freshStore();
    const s = useStore.getState();

    expect(s.backendHost).toBe("http://localhost:8000");
  });
});
