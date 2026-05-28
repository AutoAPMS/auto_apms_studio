import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({ text, footer_text, position }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (tooltipRef.current) {
      const { width, height } = tooltipRef.current.getBoundingClientRect();
      setSize({ width, height });
    }
  }, [text, position]);

  if (!position) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-input-field border border-divider text-text text-xs px-2 py-1 rounded-md shadow-md max-w-80"
      style={{
        top: position.y - size.height - 8,
        left: position.x - size.width / 2,
      }}
    >
      <div className="whitespace-pre-line">{text}</div>

      {footer_text && <div className="text-highlight pt-1">{footer_text}</div>}
    </div>,
    document.body
  );
}
