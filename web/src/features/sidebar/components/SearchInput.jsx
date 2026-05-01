/**
 * SearchInput component
 *
 * Reusable search input field with consistent styling
 *
 * @param {string} placeholder - Placeholder text for the input
 * @param {function} onChange - Callback when search text changes
 * @param {boolean} autoFocus- determines whether focus is set automatically or not
 * @returns {React.JSX.Element} Styled search input
 */
export default function SearchInput({
  placeholder = "Search..",
  onChange,
  autoFocus,
}) {
  return (
    <div className="bg-input-field font-mono text-sm border border-divider rounded-md px-2 py-1.5 mb-3 hover:border-highlight focus-within:border-highlight transition-colors">
      <input
        className="w-full bg-transparent focus:outline-none text-sm text-text"
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
    </div>
  );
}
