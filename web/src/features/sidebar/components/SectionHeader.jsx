import { Plus } from "lucide-react";

/**
 * SectionHeader component
 *
 * Reusable header with icon, title and optional action button
 *
 * @param {React.Component} icon - Lucide icon component
 * @param {string} title - Section title text
 * @param {string} color - Border and background color
 * @param {function} onActionClick - Optional callback for action button
 * @param {React.Component} actionIcon - Optional icon for the action button (defaults to Plus)
 * @returns {React.JSX.Element} Styled section header
 */
export default function SectionHeader({
  title,
  color,
  onActionClick,
  icon,
  actionIcon,
}) {
  const Icon = icon ?? Plus;
  const ActionIcon = actionIcon ?? Plus;

  return (
    <div className="relative flex items-center justify-between mb-3">
      <div className="flex items-center gap-1">
        <div
          className="border-2 rounded-md mr-1 w-6 h-6 flex items-center justify-center"
          style={{
            backgroundColor: `${color}99`,
            borderColor: color,
          }}
        >
          <Icon className="h-4.5 w-4.5 text-text" />
        </div>
        <span className="text-text text-xs font-bold tracking-wider">
          {title}
        </span>
      </div>

      {onActionClick && (
        <button
          className="border-2 rounded-md absolute right-0 w-6 h-6 flex items-center justify-center cursor-pointer transition-colors hover:bg-opacity-80"
          style={{
            backgroundColor: `${color}99`,
            borderColor: color,
          }}
          onClick={onActionClick}
        >
          <ActionIcon className="h-4.5 w-4.5 text-text" />
        </button>
      )}
    </div>
  );
}
