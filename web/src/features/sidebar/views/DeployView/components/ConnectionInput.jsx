export default function ConnectionInput({
  ip,
  port,
  onIpChange,
  onPortChange,
  disabled,
}) {
  const field =
    "flex items-center gap-2 bg-input-field border border-divider rounded-md px-2 py-1.5 hover:border-highlight focus-within:border-highlight transition-colors";
  const input =
    "nodrag flex-1 bg-transparent focus:outline-none text-sm min-w-0 text-text disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex-1 min-w-0 ${field}`}>
        <input
          value={ip}
          onChange={(e) => onIpChange(e.target.value)}
          disabled={disabled}
          className={input}
          placeholder="127.0.0.1"
        />
        <span className="text-xs text-divider flex-none">IP</span>
      </div>
      <span className="text-divider flex-none">:</span>
      <div className={`w-28 shrink-0 ${field}`}>
        <input
          value={port}
          onChange={(e) => onPortChange(e.target.value)}
          disabled={disabled}
          className={input}
          placeholder="8000"
        />
        <span className="text-xs text-divider flex-none">PORT</span>
      </div>
    </div>
  );
}
