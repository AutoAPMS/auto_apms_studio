import CustomDropdown from "../../../components/CustomDropdown.jsx";

function ThemeSection({ theme, setTheme }) {
  const themeOptions = [
    { value: "dark", label: "Dark Theme (Default)" },
    { value: "light", label: "Light Theme" },
    { value: "nightfall", label: "Nightfall Theme" },
    { value: "catppuccin-macchiato", label: "Catppuccin Macchiato" },
    { value: "inferno", label: "Inferno Theme (Experimental)" },
    { value: "glamour", label: "Glamour Theme (Experimental)" },
  ];

  const previewVars = [
    "--text-color",
    "--background",
    "--input-field",
    "--divider",
    "--highlight",
    "--syntax-name",
    "--workspace",
  ];

  return (
    <div>
      <div className="text-xs uppercase text-gray-500 mb-3">THEME</div>
      <div className="flex gap-2">
        <div className="flex-1">
          <CustomDropdown
            value={theme}
            onChange={setTheme}
            options={themeOptions}
            placeholder="Select theme.."
            showColors={false}
          />
        </div>

        <div
          className="flex gap-1 px-3 py-2 border border-divider rounded-md flex-none items-center"
          aria-hidden
        >
          {previewVars.map((v) => (
            <div
              key={v}
              className="w-4 h-4 rounded border border-divider bg-inp"
              style={{ backgroundColor: `var(${v})` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemeSection;
