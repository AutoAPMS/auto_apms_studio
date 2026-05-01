import FilePicker from "./FilePicker.jsx";

/**
 * HomeViewPopup component for home view
 * Renders a button and file picker inside a centered overlay
 *
 * @param {boolean} open - controls visibility of the popup
 * @param {function} onClose - handles click events of buttons
 * @returns {React.JSX.Element|null} - returns the popup or null if "open" is false
 * @component
 */
function HomeViewPopup({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="popup w-full h-full bg-gray-400/40 flex flex-col items-center justify-center gap-2 rounded-md">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        New File
      </button>

      <FilePicker />
    </div>
  );
}

export default HomeViewPopup;
