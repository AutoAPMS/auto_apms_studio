import { useState, useRef, useCallback, useEffect } from "react";
import {
  buildWorkspaceUrl,
  WS_PATHS,
  createWebSocket,
} from "../services/droneWebSocket";

/**
 * Custom React Hook to manage the mission deployment process.
 *
 * @param ip
 * @param port
 * @returns {{missionStatus: unknown, missionError: unknown, isRunning: boolean, isCancelling: boolean, deploy: (function(*): void)|*, cancel: (function(): void)|*}}
 */
export function useMission(ip, port) {
  const [missionStatus, setMissionStatus] = useState(null);
  const [missionError, setMissionError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const wsRef = useRef(null);
  const isRunningRef = useRef(false);
  const isCancellingRef = useRef(false);
  const cancelTimeoutRef = useRef(null);

  const deploy = useCallback(
    (xml) => {
      setMissionError(null);
      setMissionStatus(null);
      isCancellingRef.current = false;
      setIsCancelling(false);
      clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = null;

      const oldWs = wsRef.current;
      wsRef.current = null;
      oldWs?.close();

      const url = buildWorkspaceUrl(ip, port, WS_PATHS.MISSION);

      const ws = createWebSocket(url, {
        onOpen: () => {
          if (wsRef.current !== ws) return;
          ws.send(xml);
          setMissionStatus("Sending Mission Request to Drone");
          isRunningRef.current = true;
          setIsRunning(true);
        },

        onMessage: (data) => {
          if (wsRef.current !== ws) return;
          switch (data.type) {
            case "status":
              setMissionStatus(data.message);
              break;

            case "feedback":
              setMissionStatus(
                `${data.execution_state} – ${data.running_action || "..."}`
              );
              break;

            case "result":
              clearTimeout(cancelTimeoutRef.current);
              cancelTimeoutRef.current = null;
              isRunningRef.current = false;
              isCancellingRef.current = false;
              setIsRunning(false);
              setIsCancelling(false);
              if (data.tree_result === "SUCCESS") {
                setMissionStatus(`Mission succeeded: ${data.message}`);
              } else if (data.tree_result === "CANCELLED") {
                setMissionStatus("Mission cancelled.");
              } else {
                setMissionError(
                  `Mission failed (${data.tree_result}): ${data.message}`
                );
                setMissionStatus(null);
              }
              break;

            case "error":
              clearTimeout(cancelTimeoutRef.current);
              cancelTimeoutRef.current = null;
              isRunningRef.current = false;
              isCancellingRef.current = false;
              setIsRunning(false);
              setIsCancelling(false);
              setMissionError(`Mission error: ${data.message}`);
              setMissionStatus(null);
              break;

            default:
              console.warn("Error - Unknown Data type: ", data.type);
          }
        },

        onClose: () => {
          if (wsRef.current !== ws) return;
          wsRef.current = null;
          clearTimeout(cancelTimeoutRef.current);
          cancelTimeoutRef.current = null;
          const wasRunning = isRunningRef.current;
          const wasCancelling = isCancellingRef.current;
          isRunningRef.current = false;
          isCancellingRef.current = false;
          setIsRunning(false);
          setIsCancelling(false);
          // Show an unexpected-disconnect error only when still running and
          // the user did not initiate a cancel (a clean cancel receives a
          // result message first, which already resets isRunning).
          if (wasRunning && !wasCancelling) {
            setMissionError("Error - Mission connection closed unexpectedly");
            setMissionStatus(null);
          }
        },

        onError: () => {
          if (wsRef.current !== ws) return;
          isRunningRef.current = false;
          isCancellingRef.current = false;
          setIsRunning(false);
          setIsCancelling(false);
          setMissionError("Error - Failed to connect to mission endpoint");
          setMissionStatus(null);
        },
      });

      wsRef.current = ws;
    },
    [ip, port]
  );

  /**
   * Sends a cancel request to the backend, which will cancel the active
   * ROS 2 action goal.  The WebSocket stays open until the server confirms
   * cancellation via a result message and closes the connection itself.
   */
  const cancel = useCallback(() => {
    if (!wsRef.current || !isRunningRef.current) return;
    isCancellingRef.current = true;
    setIsCancelling(true);
    try {
      wsRef.current.send(JSON.stringify({ type: "cancel" }));
    } catch {
      // If the send fails the connection is already gone – clean up locally
      wsRef.current = null;
      isRunningRef.current = false;
      isCancellingRef.current = false;
      setIsRunning(false);
      setIsCancelling(false);
      return;
    }
    // If the backend doesn't confirm the cancel within 10 s, close forcefully
    cancelTimeoutRef.current = setTimeout(() => {
      if (!isCancellingRef.current) return;
      const ws = wsRef.current;
      wsRef.current = null;
      isRunningRef.current = false;
      isCancellingRef.current = false;
      setIsRunning(false);
      setIsCancelling(false);
      setMissionError("Cancel timed out – no response from backend.");
      setMissionStatus(null);
      ws?.close();
    }, 10_000);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(cancelTimeoutRef.current);
      wsRef.current?.close();
    };
  }, []);

  return {
    missionStatus,
    missionError,
    isRunning,
    isCancelling,
    deploy,
    cancel,
  };
}
