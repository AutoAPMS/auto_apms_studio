import NodePanel from "./components/NodePanel/NodePanel.jsx";
import TreePanel from "./components/TreePanel/TreePanel.jsx";

/**
 * CreateView
 * Displays the TreeListManager and NodeListManager for the "Create" sidebar view.
 *
 * @returns {React.JSX.Element}
 * @constructor
 */
export default function CreateView() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-0 p-2">
        <TreePanel />
      </div>

      <div className="flex-none h-px bg-divider" />

      <div className="flex-1 min-h-0 p-2">
        <NodePanel />
      </div>
    </div>
  );
}
