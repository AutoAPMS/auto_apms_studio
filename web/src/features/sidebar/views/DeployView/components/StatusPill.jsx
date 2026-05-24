import { RadioTower, WifiOff, Loader } from "lucide-react";

export default function StatusPill({ connected, connecting, ping }) {
  let icon;
  if (connected) {
    icon = <RadioTower className="w-5 h-5" />;
  } else if (connecting) {
    icon = <Loader className="w-5 h-5 animate-spin" />;
  } else {
    icon = <WifiOff className="w-5 h-5" />;
  }

  let label;
  if (connected) {
    label = "CONNECTED";
  } else if (connecting) {
    label = "CONNECTING...";
  } else {
    label = "DISCONNECTED";
  }

  let colorClass;
  if (connected) {
    colorClass =
      "text-status-connected border-status-connected bg-status-connected";
  } else if (connecting) {
    colorClass = "text-info border-info bg-info/10";
  } else {
    colorClass =
      "text-status-disconnected border-status-disconnected bg-status-disconnected";
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold tracking-widest rounded-md border-2 ${colorClass}`}
    >
      {icon}
      {label}
      {connected && ping != null && (
        <>
          <span className="ml-auto">{ping} ms</span>
          <span className="w-2 h-2 rounded-full bg-status-connected-dot animate-pulse" />
        </>
      )}
    </div>
  );
}
