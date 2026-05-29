import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import Tooltip from "../../../../components/Tooltip.jsx";

export default function PortItem({ port, onValueChange, readOnly }) {
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [value, setValue] = useState("");

  const DIR_STYLES = {
    IN: "bg-[#A10443]/34 border-1 border-[#A10443] text-[#A10443]",
    OUT: "bg-[#4C4873]/34 border-1 border-[#4C4873] text-[#4C4873]",
    "IN/OUT": "bg-[#00879F]/34 border-1 border-[#00879F] text-[#00879F]",
    PRE: "bg-[#9B7B4C]/34 border-1 border-[#9B7B4C] text-[#9B7B4C]",
    POST: "bg-[#6B7B9B]/34 border-1 border-[#6B7B9B] text-[#6B7B9B]",
  };

  const handleMouseEnter = (text, footer) => (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: text,
      footer: footer,
    });
  };

  const handleIconMouseEnter = (description) => (e) => {
    if (!description) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: description,
      footer: "",
    });
  };

  const handleMouseLeave = () => {
    setTooltipPosition(null);
  };

  const handleBlur = (e) => {
    const newValue = e.target.value;
    if (newValue !== port.default && onValueChange) {
      onValueChange(port.name, newValue);
    }
  };

  useEffect(() => {
    setValue(port.default);
  }, [port.default]);

  return (
    <>
      <div className="flex flex-row w-full">
        <div
          className={`${DIR_STYLES[port.direction]} items-center rounded-l-md flex p-1 gap-1
                      text-xs w-30 justify-between cursor-help`}
          onMouseEnter={handleMouseEnter(port.name, port.type)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="font-bold justify-start">{port.direction}</div>
          <div className="bg-input-field p-1 text-xs text-text rounded-md">
            {port.name.length > 11
              ? port.name.substring(0, 11) + ".."
              : port.name}
          </div>
        </div>

        <div className="flex flex-1 w-0 text-xs bg-input-field items-center justify-between rounded-r-md border-l-0 border border-divider p-2 gap-2">
          <input
            type="text"
            value={value}
            placeholder="Enter value.."
            className="nodrag flex flex-1 justify-start focus:outline-none placeholder:text-[#5C5C5C] placeholder:italic placeholder:text-xs bg-transparent min-w-0"
            onBlur={handleBlur}
            onChange={(e) => setValue(e.target.value)}
            readOnly={readOnly}
          />
          {port.description && (
            <CircleHelp
              size={14}
              className="text-[#5C5C5C] hover:text-text cursor-help"
              onMouseEnter={handleIconMouseEnter(port.description)}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </div>
      </div>

      <Tooltip
        text={tooltipPosition?.text}
        footer_text={tooltipPosition?.footer}
        position={tooltipPosition}
      />
    </>
  );
}
