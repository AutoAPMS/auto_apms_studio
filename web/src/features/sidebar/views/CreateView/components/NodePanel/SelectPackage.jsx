/**
 * SelectPackage component
 *
 * Provides a list of checkboxes for all package names.
 * Allows the user to select and deselect packages.
 * When selected, the package name is added to selectedPackages.
 * When deselected, the package name is removed from selectedPackages.
 *
 *
 * @param nodes array of node objects
 * @param setSelectedPackages updates selectedPackages, default array contains all packages
 * @param selectedPackages array of currently selected package names
 * @returns {React.JSX.Element} list of checkboxes with package names
 */

function SelectPackage({ nodes, setSelectedPackages, selectedPackages }) {
  const handleSelectPackage = (event, packageName) => {
    if (event.target.checked) {
      setSelectedPackages([...selectedPackages, packageName]);
    } else {
      setSelectedPackages(
        selectedPackages.filter((name) => name !== packageName)
      );
    }
  };

  const packages = [...new Set(nodes.map((node) => node.package))].sort();

  return (
    <ul className="flex flex-col gap-1">
      {packages.map((packageName) => (
        <li
          key={packageName}
          className="flex items-center gap-2 hover:bg-white/5 p-1 rounded transition-colors"
        >
          <label className="flex items-center gap-2 cursor-pointer w-full select-none">
            <input
              type="checkbox"
              className="checkbox checkbox-xs bg-[#05b8cf] border-0"
              checked={selectedPackages.includes(packageName)}
              onChange={(event) => handleSelectPackage(event, packageName)}
            />
            <span className="text-xs text-text truncate" title={packageName}>
              {packageName}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export default SelectPackage;
