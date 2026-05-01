import { useState, useEffect } from "react";
import { useStore } from "../../../store/treeStore.js";

/**
 * Custom React Hook for fetching nodes from the backend API.
 *
 * This hook fetches node objects from the endpoint:
 * `${backendHost}/api/v1/node_modules` and stores them in an array.
 * If that fails it falls back to fetching `/node_models.json` from the public folder at runtime.
 * @returns {{nodes: *[], error: unknown, clearError: function(): void}} array containing node objects, any error encountered during fetching, and a function to clear the error.
 */
export function useFetchNodes() {
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState(null);
  const backendHost = useStore((s) => s.backendHost);
  const nodeFetchTrigger = useStore((s) => s.nodeFetchTrigger);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const guard =
      (fn) =>
      (...args) =>
        isMounted && fn(...args);
    const safeSet = (n, e) => {
      if (isMounted) {
        setNodes(n);
        setError(e);
      }
    };

    async function fetchNodes() {
      try {
        const res = await fetch(`${backendHost}/api/v1/node_modules`, {
          signal: controller.signal,
        });
        if (!isMounted) return;
        clearTimeout(timeoutId);

        if (res.ok) {
          const { nodes = [] } = await res.json();
          return safeSet(nodes, null);
        }
        setError(
          `Network error: Backend returned HTTP ${res.status}. Attempting local fallback.`
        );
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.name === "AbortError"
            ? "Network timeout: Backend did not respond in time. Attempting local fallback."
            : "Network error: Failed to fetch node modules from backend: " + err
        );
      }

      try {
        const res = await fetch("/node_models.json");
        if (!isMounted) return;
        res.ok
          ? safeSet(
              (await res.json()) ?? [],
              "Network error: Failed to fetch node modules from backend. Using local fallback data."
            )
          : safeSet([], `Node Modules fallback returned HTTP ${res.status}`);
      } catch (err) {
        if (isMounted)
          safeSet(
            [],
            "Node Modules failed to load from backend and local fallback: " +
              err
          );
      }
    }

    void fetchNodes();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [backendHost, nodeFetchTrigger]);

  const isInfo =
    typeof error === "string" &&
    (error.startsWith("Network error") || error.startsWith("Network timeout"));

  return {
    nodes,
    error,
    status: isInfo ? "info" : "error",
    clearError: () => setError(null),
  };
}
