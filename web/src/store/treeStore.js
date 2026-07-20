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
 * @property {string} backendProtocol - Protocol (http/https) chosen dynamically based on window.location.protocol.
 * @property {string} backendHost - Derived backend host URL (e.g., `https://ip:port` for HTTPS origin, `http://ip:port` for HTTP).
 *                                   Protocol is automatically selected to match the current page's protocol (HTTPS/HTTP)
 *                                   to avoid Mixed Content Policy violations.
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
      backendProtocol: "http",
      backendHost: "http://localhost:8000",

      nodeFetchTrigger: 0,
      triggerNodeFetch: () =>
        set((state) => ({ nodeFetchTrigger: state.nodeFetchTrigger + 1 })),

      getBackendProtocol: () => {
        if (typeof window !== "undefined") {
          return window.location.protocol === "https:" ? "https" : "http";
        }
        return "http";
      },

      setBackendIp: (ip) => {
        const state = get();
        const protocol = state.getBackendProtocol();
        set({
          backendIp: ip,
          backendProtocol: protocol,
          backendHost: `${protocol}://${ip}:${state.backendPort}`,
        });},

      setBackendPort: (port) => {
        const state = get();
        const protocol = state.getBackendProtocol();
        set({
          backendPort: port,
          backendProtocol: protocol,
          backendHost: `${protocol}://${state.backendIp}:${port}`,
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
        backendProtocol: state.backendProtocol,
        treeManifests: state.treeManifests,
        selectedTree: state.selectedTree,
        selectedTreeId: state.selectedTreeId,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http";
          state.backendProtocol = protocol;
          state.backendHost = `${protocol}://${state.backendIp}:${state.backendPort}`;
        }},
    }
  )
);
