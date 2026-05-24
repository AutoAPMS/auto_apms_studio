/**
 * Build WebSocket URL using IP, Port, and Path.
 *
 * @param {string} ip    – IPv4-Address or hostname, e.g.: "127.0.0.1" (localhost)
 * @param {string} port  – Port as a String or Number, e.g.: "8000" (default)
 * @param {string} path  – Path with beginning slash, e.g.: "/ws/v1/status"
 * @param {string} token – Optional API key token
 * @returns {string}     – Finished URL, e.g. "wss://127.0.0.1:8000/ws/v1/status?token=..."
 */
export function buildWorkspaceUrl(ip, port, path, token = "") {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${protocol}://${ip}:${port}${path}${query}`;
}

export const WS_PATHS = {
  STATUS: "/ws/v1/status",
  MISSION: "/ws/v1/mission/mission",
};

/**
 * Create WebSocket and attach event handlers.
 *
 * @param {string} url                  - Complete WebSocket URL
 * @param {{}} handlers                 - Handlers for WebSocket events
 * @param {Function} handlers.onOpen    - Called when the connection is open
 * @param {Function} handlers.onMessage - Called when a message is received
 * @param {Function} handlers.onClose   - Called when the connection is closed
 * @param {Function} handlers.onError   - Called when an error occurs
 * @returns {WebSocket}                 - The native WebSocket object
 *
 * Usage Example for HooK:
 * const ws = createWebSocket(url, handlers);
 * ws.close();
 *
 * where handlers is an object with optional onOpen, onMessage, onClose, onError functions.
 */
export function createWebSocket(url, handlers = {}) {
  const { onOpen, onMessage, onClose, onError } = handlers;

  const ws = new WebSocket(url);

  ws.onopen = () => {
    onOpen?.();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch {
      onError?.(new Error(`Error - JSON is Invalid: ${event.data}`));
    }
  };

  ws.onclose = () => {
    onClose?.();
  };

  ws.onerror = () => {
    onError?.(new Error(`Error - WebSocket Error for ${url}`));
  };

  return ws;
}
