import { Ban, X, Info } from "lucide-react";
/**
 * Node List Error Alert component
 *
 * Renders an error alert box at the top-right corner of the screen
 *
 * @param error Error object or null
 * @param onClose Function to handle closing the alert
 * @returns {React.JSX.Element|null} The error alert component or null if no error
 * @constructor
 */
const VARIANTS = {
  error: {
    border: "border-error",
    bg: "bg-error",
    icon: Ban,
  },
  info: {
    border: "border-info",
    bg: "bg-info",
    icon: Info,
  },
};

export function ErrorAlert({ error, onClose, status = "error" }) {
  if (!error) return null;

  const { border, bg, icon: Icon } = VARIANTS[status] ?? VARIANTS.error;

  return (
    <div
      className={`fixed top-5 right-5 z-30 w-100 h-14 bg-input-field ${border} border rounded-md overflow-hidden px-3`}
    >
      <div className="flex items-center gap-3 h-full">
        <div
          className={`${bg} w-8 h-8 rounded-md shrink-0 flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span
          className="flex-1 wrap-break-word leading-tight text-white"
          style={{ fontSize: "0.8125rem" }}
        >
          {error.toString()}
        </span>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 md:duration-300 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
