import SelectPackage from "./SelectPackage.jsx";

export default function NodeFilter({
  nodes,
  setSortType,
  sortType,
  setSelectedPackages,
  selectedPackages,
  isOpen,
  setIsOpen,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={() => setIsOpen(false)}
      />
      <div className="absolute right-0 top-9 z-50 w-64 bg-input-field border border-divider rounded-md shadow-xl">
        <div className="p-2">
          <div className="mb-2">
            <label className="text-xs uppercase text-text mb-2 text-highlight block">
              Sort by
            </label>
            <div className="flex gap-1">
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer border-2 flex-1 transition-colors ${
                  sortType === "Package"
                    ? "bg-[#05b8cf] border-[#05b8cf] text-white"
                    : "bg-[#05b8cf]/60 border-[#05b8cf] text-text hover:bg-[#05b8cf]/80"
                }`}
                onClick={() => setSortType("Package")}
              >
                Package
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer border-2 flex-1 transition-colors ${
                  sortType === "NodeType"
                    ? "bg-[#05b8cf] border-[#05b8cf] text-white"
                    : "bg-[#05b8cf]/60 border-[#05b8cf] text-text hover:bg-[#05b8cf]/80"
                }`}
                onClick={() => setSortType("NodeType")}
              >
                Node Type
              </button>
            </div>
          </div>

          <div className="h-px bg-divider my-2 -mx-2" />

          <div>
            <label className="text-xs uppercase text-highlight mb-2 block">
              Select Packages
            </label>
            <div className="bg-background border border-divider rounded-md p-2 max-h-45.5 overflow-y-scroll">
              <SelectPackage
                nodes={nodes}
                selectedPackages={selectedPackages}
                setSelectedPackages={setSelectedPackages}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
