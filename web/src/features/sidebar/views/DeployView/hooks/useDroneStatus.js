import { useState, useRef, useCallback, useEffect } from "react";
import {
  buildWorkspaceUrl,
  WS_PATHS,
  createWebSocket,
} from "../services/droneWebSocket";
import { useStore } from "../../../../../store/treeStore.js";

const PING_TIMEOUT_MS = 3000;

/**
 * Custom React Hook to manage the connection status to the drone backend.
 * Connection to the backend is established using a WebSocket.
 *
 * @returns {{connected: boolean, ping: number|null, error: string|null, ip: string, port: string, setIp: function(string): void, setPort: function(string): void, connect: function(): void, disconnect: function(): void}}
 */
export function useDroneStatus() {
  const [connected, setConnected] = useState(false);
  const [ping, setPing] = useState(null);
  const [error, setError] = useState(null);

  const storeIp = useStore((state) => state.backendIp);
  const storePort = useStore((state) => state.backendPort);

  const queryParams = new URLSearchParams(window.location.search);
  const defaultIp = queryParams.get("ip") || storeIp || "127.0.0.1";
  const defaultPort = queryParams.get("port") || storePort || "8000";
  const defaultToken = queryParams.get("token") || "";

  const [ip, setIp] = useState(defaultIp);
  const [port, setPort] = useState(defaultPort);
  const [token, setToken] = useState(defaultToken);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (!queryParams.get("ip")) {
      setIp(storeIp);
    }
  }, [storeIp]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (!queryParams.get("port")) {
      setPort(storePort);
    }
  }, [storePort]);

  const wsRef = useRef(null);
  const pingTimeoutRef = useRef(null);
  const pingEmaRef = useRef(null);
  const firstReceivedRef = useRef(false);
  const [connecting, setConnecting] = useState(false);

  /**
   * If ping is not received within 3 seconds, the connection is considered lost.
   * This function resets the ping timeout whenever a new ping is received.
   *
   * @type {(function(): void)|*}
   */
  const resetPingTimeout = useCallback(() => {
    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);

    pingTimeoutRef.current = setTimeout(() => {
      setError(
        "Error - Connection not received within 3 seconds, Connection may be terminated"
      );
      setConnected(false);
      setPing(null);
    }, PING_TIMEOUT_MS);
  }, []);

  /**
   * Connects to the drone backend using a WebSocket.
   *
   * @type {(function(): void)|*}
   */
  const connect = useCallback(() => {
    setError(null);
    setConnecting(true);
    wsRef.current?.close();

    const url = buildWorkspaceUrl(ip, port, WS_PATHS.STATUS, token);

    wsRef.current = createWebSocket(url, {
      onOpen: () => {
        resetPingTimeout();
      },

      onMessage: (data) => {
        if (data.type === "error") {
          setConnecting(false);
          setConnected(false);
          setError(`Backend error: ${data.message}`);
          return;
        }
        if (data.type === "status") {
          setConnecting(false);
          setConnected(true);
          const measured =
            data && typeof data.ping_ms === "number" ? data.ping_ms : null;

          if (measured != null) {
            if (!firstReceivedRef.current) {
              firstReceivedRef.current = true;
              pingEmaRef.current = measured;
            } else {
              pingEmaRef.current = 0.1 * measured + 0.9 * pingEmaRef.current;
            }
            setPing(Math.round(pingEmaRef.current * 100) / 100);
          } else {
            setPing(null);
          }

          setError(null);
          resetPingTimeout();
          return;
        }

        if (data.type === "ping") {
          try {
            wsRef.current?.send(JSON.stringify({ type: "pong" }));
          } catch {
            void 0;
          }
        }
      },

      onClose: () => {
        setConnected(false);
        setPing(null);
        if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
      },

      onError: () => {
        setError(
          `Error Connection to ${ip}:${port} failed – is the Backend WS Endpoint running?`
        );
        setConnected(false);
        setPing(null);
      },
    });
  }, [ip, port, token, resetPingTimeout]);

  /* Disconnects from the drone backend. */
  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;

    setConnecting(false);
    setConnected(false);
    setPing(null);
    setError(null);

    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
    };
  }, []);

  return {
    connected,
    connecting,
    ping,
    error,
    ip,
    port,
    token,
    setIp,
    setPort,
    setToken,
    connect,
    disconnect,
  };
}
