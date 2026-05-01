import ContextMenu from "../../../sidebar/components/ContextMenu.jsx";
import { useEffect, useState } from "react";

export default function PortRemapItem({
  port,
  canRenamePort,
  handlePortChange,
  handlePortDelete,
  readOnly,
}) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const handlePortNameUpdate = (e) => {
    const newName = e.target.value;
    if (newName !== port.name && canRenamePort(newName))
      handlePortChange(port.name, newName, port.default);
    else setName(port.name);
  };

  const handlePortValueUpdate = (e) => {
    const newValue = e.target.value;
    if (newValue !== port.default)
      handlePortChange(port.name, port.name, newValue);
  };

  useEffect(() => {
    setName(port.name);
    setValue(port.default);
  }, [port]);

  const items = [
    {
      label: "Delete Port Remapping",
      action: () => {
        handlePortDelete(port.name);
      },
    },
  ];

  return (
    <ContextMenu items={readOnly ? [] : items}>
      <div className="flex flex-row w-full">
        <div className="w-30 flex flex-1 text-xs text-text bg-input-field items-center justify-center rounded-l-md border border-divider p-2">
          <input
            type="text"
            value={name}
            placeholder="Enter name.."
            className="w-full nodrag flex flex-1 justify-start focus:outline-none placeholder:text-[#5C5C5C] placeholder:italic placeholder:text-xs bg-transparent"
            onBlur={handlePortNameUpdate}
            onChange={(e) => setName(e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="flex flex-1 text-xs bg-input-field items-center justify-center rounded-r-md border-l-0 border border-divider p-2">
          <input
            type="text"
            value={value}
            placeholder="Enter value.."
            className="nodrag flex flex-1 justify-start focus:outline-none placeholder:text-[#5C5C5C] placeholder:italic placeholder:text-xs bg-transparent"
            onBlur={handlePortValueUpdate}
            onChange={(e) => setValue(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      </div>
    </ContextMenu>
  );
}
