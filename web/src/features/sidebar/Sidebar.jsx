import { useState } from "react";
import SidebarHeader from "./components/SidebarHeader.jsx";
import SidebarFooter from "./components/SidebarFooter.jsx";
import ModeSwitcher from "./components/ModeSwitcher.jsx";

import CreateView from "./views/CreateView/CreateView.jsx";
import DeployView from "./views/DeployView/DeployView.jsx";

/**
 * Sidebar component
 * Provides basic UI structure for all sidebar components
 *
 * @returns {React.JSX.Element} UI container for sidebar components
 * @component
 */
export default function Sidebar() {
  const [isCreateMode, setIsCreateMode] = useState(true);

  return (
    <div className="invisible md:visible absolute !top-5 !left-5 !bottom-5 z-10 w-75 flex flex-col gap-2">
      <div className="flex-none h-14 bg-background border border-divider rounded-md">
        <SidebarHeader />
      </div>

      <div className="flex-1 bg-background border border-divider rounded-md flex flex-col min-h-0">
        <div className="flex-none h-16 p-2">
          <ModeSwitcher
            isCreateMode={isCreateMode}
            setIsCreateMode={setIsCreateMode}
          />
        </div>

        <div className="flex-none h-px bg-divider" />

        <div className="flex-1 flex flex-col min-h-0">
          {isCreateMode ? <CreateView /> : <DeployView />}
        </div>

        <div className="flex-none h-12 p-2">
          <SidebarFooter />
        </div>
      </div>
    </div>
  );
}
