import { Braces, Rocket } from "lucide-react";

/**
 * Renders Create and Deploy Buttons, which are used to switch the view of the sidebar
 * The switch still needs to be implemented
 * Already implemented : Colors change depending on which button is clicked, default is Deploy
 * @returns Create and Deploy Buttons
 */
export default function ModeSwitcher({ isCreateMode, setIsCreateMode }) {
  return (
    <div className="flex border border-divider rounded-md p-1 gap-1 h-full">
      <button
        className={`flex-1 flex h-full rounded items-center justify-center md:duration-300 cursor-pointer gap-1 relative ${
          isCreateMode
            ? "text-white"
            : "text-gray-400 hover:bg-highlight hover:text-white"
        }`}
        onClick={() => setIsCreateMode(true)}
      >
        {isCreateMode && (
          <>
            <div className="absolute inset-0 bg-linear-to-r from-[#f02a6c] to-purple-600 rounded" />
            <div className="absolute inset-0.5 bg-linear-to-r from-[#8b1538]/80 to-purple-900/80 rounded" />
          </>
        )}
        <Braces className="w-6 h-6 relative z-10" />
        <span className="font-semibold text-lg relative z-10">CREATE</span>
      </button>

      <button
        className={`flex-1 flex h-full rounded items-center justify-center md:duration-300 cursor-pointer gap-1 relative ${
          !isCreateMode
            ? "text-white"
            : "text-gray-400 hover:bg-highlight hover:text-white"
        }`}
        onClick={() => setIsCreateMode(false)}
      >
        {!isCreateMode && (
          <>
            <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-[#05b8cf] rounded" />
            <div className="absolute inset-0.5 bg-linear-to-r from-purple-900/80 to-[#034e5c]/80 rounded" />
          </>
        )}
        <Rocket className="w-6 h-6 relative z-10" />
        <span className="font-semibold text-lg relative z-10">DEPLOY</span>
      </button>
    </div>
  );
}
