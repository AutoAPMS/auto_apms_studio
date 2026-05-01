import { buildJsonToXml } from "../../../services/xmlService";
import { buildDeployJson } from "../../../services/jsonService";
import { downloadXml } from "../../../services/downloadService";
import { useStore } from "../../../store/treeStore";

/**
 * Hook for exporting behavior trees as XML files.
 *
 * @param {Object|null} rootAttrs - Root XML attributes.
 * @param {Object|null} xmlDeclaration - XML declaration metadata.
 * @returns {Object} Export utilities.
 * @returns {Function} exportTree - Exports a single tree.
 */
export function useTreeExport(rootAttrs, xmlDeclaration) {
  const allTrees = useStore((state) => state.trees);

  const exportTree = (tree, treeId) => {
    if (!tree) {
      console.warn("No tree to export");
      return;
    }

    try {
      const deployJson = buildDeployJson(
        treeId,
        allTrees,
        rootAttrs,
        xmlDeclaration
      );
      const xmlContent = buildJsonToXml(deployJson);
      downloadXml(xmlContent, treeId);
    } catch (error) {
      console.error("Failed to export tree:", error);
      alert("Failed to export tree. Check console for details.");
    }
  };

  return { exportTree };
}
