import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-full px-2 py-1.5 text-left rounded-md cursor-pointer transition-colors text-sm flex items-center justify-between
                  bg-input-field border border-divider text-text focus-within:border-highlight focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-1 w-full rounded-md overflow-y-auto z-10 shadow-lg
                        bg-input-field border border-divider max-h-30"
        >
          {options.map((option) => (
            <div
              key={option.value}
              className="px-2 py-1.5 cursor-pointer transition-colors text-sm text-text hover:bg-highlight"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
