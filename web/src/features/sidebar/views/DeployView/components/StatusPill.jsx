import { RadioTower, WifiOff } from "lucide-react";

export default function StatusPill({ connected, ping }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold tracking-widest rounded-md border-2 ${
        connected
          ? "text-status-connected border-status-connected bg-status-connected"
          : "text-status-disconnected border-status-disconnected bg-status-disconnected"
      }`}
    >
      {connected ? (
        <RadioTower className="w-5 h-5" />
      ) : (
        <WifiOff className="w-5 h-5" />
      )}
      {connected ? "CONNECTED" : "DISCONNECTED"}
      {connected && ping != null && (
        <>
          <span className="ml-auto">{ping} ms</span>
          <span className="w-2 h-2 rounded-full bg-status-connected-dot animate-pulse" />
        </>
      )}
    </div>
  );
}
