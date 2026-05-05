/**
 * Build WebSocket URL using IP, Port, and Path.
 *
 * @param {string} ip    – IPv4-Address or hostname, e.g.: "127.0.0.1" (localhost)
 * @param {string} port  – Port as a String or Number, e.g.: "8000" (default)
 * @param {string} path  – Path with beginning slash, e.g.: "/ws/v1/status"
 * @returns {string}     – Finished URL, z.B. "ws://127.0.0.1:8000/ws/v1/status"
 *
 * For Example:
 * buildWorkspaceUrl("127.0.0.1", "8000", "/ws/v1/status"),
 * will then create the URL "ws://127.0.0.1:8000/ws/v1/status".
 */
export function buildWorkspaceUrl(ip, port, path) {
  return `ws://${ip}:${port}${path}`;
}

export const WS_PATHS = {
  STATUS: "/ws/v1/status",
  MISSION: "/ws/v1/mission",
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
