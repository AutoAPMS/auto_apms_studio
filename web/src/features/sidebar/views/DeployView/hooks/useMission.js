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
 * @returns {{missionStatus: unknown, missionError: unknown, isRunning: boolean, deploy: (function(*): void)|*, cancel: (function(): void)|*}}
 */
export function useMission(ip, port) {
  const [missionStatus, setMissionStatus] = useState(null);
  const [missionError, setMissionError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const wsRef = useRef(null);
  const isRunningRef = useRef(false);

  /**
   * Deploys a mission by sending the provided XML to the backend via WebSocket.
   * The websocket uses a Tree Executor to process the mission.
   *
   * @type {(function(*): void)|*}
   */
  const deploy = useCallback(
    (xml) => {
      setMissionError(null);
      setMissionStatus(null);

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
              isRunningRef.current = false;
              setIsRunning(false);
              if (data.tree_result === "SUCCESS") {
                setMissionStatus(`Mission succeeded: ${data.message}`);
              } else {
                setMissionError(
                  `Mission failed (${data.tree_result}): ${data.message}`
                );
                setMissionStatus(null);
              }
              break;

            case "error":
              isRunningRef.current = false;
              setIsRunning(false);
              setMissionError(`Mission error: ${data.message}`);
              setMissionStatus(null);
              break;

            default:
              console.warn("Error - Unknown Data type: ", data.type);
          }
        },

        onClose: () => {
          if (wsRef.current !== ws) return;
          if (isRunningRef.current) {
            setMissionError("Error - Mission connection closed unexpectedly");
            setMissionStatus(null);
          }
          isRunningRef.current = false;
          setIsRunning(false);
        },

        onError: () => {
          if (wsRef.current !== ws) return;
          isRunningRef.current = false;
          setIsRunning(false);
          setMissionError("Error - Failed to connect to mission endpoint");
          setMissionStatus(null);
        },
      });

      wsRef.current = ws;
    },
    [ip, port]
  );

  /* Cancels the current mission deployment. */
  const cancel = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    isRunningRef.current = false;
    setIsRunning(false);
    setMissionStatus(null);
    setMissionError(null);
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    missionStatus,
    missionError,
    isRunning,
    deploy,
    cancel,
  };
}
