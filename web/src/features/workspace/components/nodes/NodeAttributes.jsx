import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PortItem from "../ui/PortItem.jsx";

function NodeAttributes({ nodeAttributes, onAttributeChange, readOnly }) {
  const [isAttributesOpen, setIsAttributesOpen] = useState(false);

  if (!nodeAttributes?.length) return null;

  return (
    <details
      className="collapse rounded-none!"
      open={isAttributesOpen}
      onToggle={(e) => setIsAttributesOpen(e.currentTarget.open)}
    >
      <summary className="collapse-title text-sm text-[#5C5C5C] px-0 py-2 min-h-0 flex items-center justify-between cursor-pointer">
        <span>Attributes</span>
        <div className="flex items-center gap-2">
          <span className="bg-input-field border border-divider rounded px-2 py-1 text-xs flex items-center justify-center min-w-6">
            {nodeAttributes.length}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isAttributesOpen ? "rotate-180" : ""}`}
          />
        </div>
      </summary>
      <div className="collapse-content px-0 pb-0!">
        <ul className="space-y-1 w-full mt-1">
          {nodeAttributes.map((attribute) => (
            <li key={`attr-${attribute.name}`}>
              <PortItem
                port={attribute}
                onValueChange={(attrName, newValue) =>
                  onAttributeChange?.(attrName, newValue)
                }
                readOnly={readOnly}
              />
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export default NodeAttributes;
