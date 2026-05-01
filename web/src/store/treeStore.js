import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { applyEntryTreeIdToSavedJson } from "../services/jsonService.js";

/**
 * Zustand store for managing behavior tree data, XML parsing results,
 * selection state, and backend connection configuration.
 * Uses sessionStorage for persistence during the browser tab session.
 *
 * State:
 * @property {Object|null} savedJson - Raw JSON parsed from an imported XML file.
 * @property {Object|null} selectedTree - Currently selected behavior tree (raw tree data, not persisted).
 * @property {Object|null} rootAttrs - Attributes of the XML root node (derived from savedJson).
 * @property {Array<Object>} trees - Normalized list of parsed behavior trees (derived from savedJson).
 * @property {Object|null} xmlDeclaration - XML declaration extracted from the source file (derived from savedJson).
 * @property {Object} treeManifests - Mapping of treeId to node manifest identity string.
 *
 * Backend configuration:
 * @property {string} backendIp - Backend IP address (persisted in sessionStorage).
 * @property {string} backendPort - Backend port (persisted in sessionStorage).
 * @property {string} backendHost - Derived backend host URL (`http://ip:port`, reconstructed on load).
 *
 * Actions:
 * @property {Function} setSavedJson - Updates the stored raw JSON.
 * @property {Function} setSelectedTree - Sets the currently selected tree.
 * @property {Function} setParsedData - Stores parsed XML data (rootAttrs, trees, xmlDeclaration).
 * @property {Function} setBackendIp - Updates backend IP and derived host.
 * @property {Function} setBackendPort - Updates backend port and derived host.
 * @property {Function} setTreeManifest - Sets the node manifest for a specific tree by id.
 */
export const useStore = create(
  persist(
    (set, get) => ({
      savedJson: null,
      setSavedJson: (json) => {
        set({
          savedJson: Array.isArray(json)
            ? JSON.parse(JSON.stringify(json))
            : json,
        });
      },

      rootAttrs: null,
      trees: [],
      xmlDeclaration: null,
      setParsedData: ({ rootAttrs, trees, xmlDeclaration }) =>
        set({ rootAttrs, trees, xmlDeclaration }),

      backendIp: "localhost",
      backendPort: "8000",
      backendHost: "http://localhost:8000",

      nodeFetchTrigger: 0,
      triggerNodeFetch: () =>
        set((state) => ({ nodeFetchTrigger: state.nodeFetchTrigger + 1 })),

      setBackendIp: (ip) => {
        const { backendPort } = get();
        set({
          backendIp: ip,
          backendHost: `http://${ip}:${backendPort}`,
        });
      },

      setBackendPort: (port) => {
        const { backendIp } = get();
        set({
          backendPort: port,
          backendHost: `http://${backendIp}:${port}`,
        });
      },

      selectedTree: null,
      selectedTreeId: null,
      setSelectedTree: (tree, id) =>
        set({
          selectedTree: tree,
          selectedTreeId: id,
        }),

      setEntryTreeId: (id) => {
        set({ entryTreeId: id });
        const { savedJson } = get();
        if (savedJson) {
          applyEntryTreeIdToSavedJson(savedJson, id);
          set({ savedJson });
        }
      },

      treeManifests: {},
      setTreeManifest: (treeId, manifest) =>
        set((state) => ({
          treeManifests: {
            ...state.treeManifests,
            [treeId]: manifest,
          },
        })),
    }),

    {
      name: "behavior-tree-storage",
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        trees: state.trees,
        rootAttrs: state.rootAttrs,
        savedJson: state.savedJson,
        backendIp: state.backendIp,
        backendPort: state.backendPort,
        treeManifests: state.treeManifests,
        selectedTree: state.selectedTree,
        selectedTreeId: state.selectedTreeId,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.backendHost = `http://${state.backendIp}:${state.backendPort}`;
        }
      },
    }
  )
);
