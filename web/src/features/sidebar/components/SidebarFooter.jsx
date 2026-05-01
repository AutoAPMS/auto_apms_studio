import { useRef } from "react";
import SettingsMenu from "../../settings/Settings.jsx";
import { Download } from "lucide-react";
import { Upload } from "lucide-react";
import { CircleQuestionMark } from "lucide-react";
import { Settings } from "lucide-react";

import XmlToJsonConverter from "../../../components/XmlToJsonConverter.jsx";
import JsonToXmlConverter from "../../../components/JsonToXmlConverter.jsx";
import { useStore } from "../../../store/treeStore.js";

/**
 * Bottombar component for Sidebar
 * provides 4 buttons: Import,Export, Help and Settings
 *
 * already implemented:
 * - Import: imports an XML and displays the trees in Tree List
 * - Settings: opens a settings menu(light/dark mode, change backend hosting)
 * - export: downloads an XML from the savedJson
 *
 * Future implementation:
 * - Help button
 *
 * @returns {React.JSX.Element} UI container for displaying toolbar items
 * @component
 */

function SidebarFooter() {
  const inputRef = useRef(null);
  const settingsRef = useRef(null);
  const savedJson = useStore((state) => state.savedJson);
  const entryTreeId = useStore((state) => state.entryTreeId);
  const setEntryTreeId = useStore((state) => state.setEntryTreeId);

  return (
    <div className="Buttons flex justify-between mr-1 ml-1">
      <button
        className="flex md:duration-300 cursor-pointer items-center gap-1 hover:bg-highlight text-text rounded-md px-2 py-1"
        onClick={() => inputRef.current.click()}
      >
        <Download className="w-3 h-3" />
        <span className="text-xs">Import</span>
      </button>

      <XmlToJsonConverter ref={inputRef} onLoad={() => setEntryTreeId(null)} />

      <div className="relative group">
        <JsonToXmlConverter
          data={savedJson}
          entryTreeId={entryTreeId}
          filename="full_behavior_tree"
          buttonProps={{
            className: `flex md:duration-300 items-center gap-1 text-text rounded-md px-2 py-1 ${
              entryTreeId
                ? "cursor-pointer hover:bg-highlight"
                : "opacity-40 cursor-not-allowed"
            }`,
          }}
        >
          <Upload className="w-3 h-3" />
          <span className="text-xs">Export</span>
        </JsonToXmlConverter>
        {!entryTreeId && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-45 bg-input-field border border-divider rounded-md px-3 py-2 text-xs text-text shadow-lg hidden group-hover:block">
            Default Tree must be selected. Right-click a tree and set as
            default.
          </div>
        )}
      </div>

      <button className="flex md:duration-300 cursor-pointer items-center gap-1 hover:bg-highlight text-text rounded-md px-2 py-1">
        <CircleQuestionMark className="w-3 h-3" />
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://auto-apms-studio-d50829.pages.git-ce.rwth-aachen.de/docs/"
          className="text-xs"
        >
          {" "}
          Help{" "}
        </a>
      </button>

      <button
        className="flex md:duration-300 cursor-pointer items-center gap-1 hover:bg-highlight text-text rounded-md px-2 py-1"
        onClick={() => settingsRef.current?.showModal()}
      >
        <Settings className="w-3 h-3" />
        <span className="text-xs">Settings</span>
      </button>
      <SettingsMenu ref={settingsRef} />
    </div>
  );
}

export default SidebarFooter;
