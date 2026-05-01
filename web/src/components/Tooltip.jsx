import { createPortal } from "react-dom";

export default function Tooltip({ text, footer_text, position }) {
  if (!position) return null;

  return createPortal(
    <div
      className="fixed z-50 bg-input-field border border-divider text-text text-xs px-2 py-1 rounded-md shadow-md max-w-80"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="whitespace-pre-line">{text}</div>

      {footer_text && <div className="text-highlight pt-1">{footer_text}</div>}
    </div>,
    document.body
  );
}
