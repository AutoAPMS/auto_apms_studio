import React, { useState } from "react";
import { useTreeExport } from "../../../../hooks/useTreeExport";
import ContextMenu from "../../../../components/ContextMenu.jsx";
import { useStore } from "../../../../../../store/treeStore.js";
import { useNodeManifestDialog } from "../../../DeployView/components/NodeManifestDialog.jsx";
import { buildDeployJson } from "../../../../../../services/jsonService.js";
import { buildJsonToXml } from "../../../../../../services/xmlService.js";
import { useXmlPreviewDialog } from "./XmlPreviewWindow.jsx";

export default function TreeItemContextMenu({
  tree,
  rootAttrs,
  xmlDeclaration,
  showDeleteMenu,
  setIsRenamingTree,
  children,
}) {
  const { exportTree } = useTreeExport(rootAttrs, xmlDeclaration);
  const setEntryTreeId = useStore((state) => state.setEntryTreeId);
  const entryTreeId = useStore((state) => state.entryTreeId);
  const treeManifests = useStore((state) => state.treeManifests);
  const allTrees = useStore((state) => state.trees);

  const isEntryTree = entryTreeId === tree.id;
  const currentManifest = treeManifests[tree.id] ?? null;

  const { handleOpen, dialog } = useNodeManifestDialog(tree.id);

  const [xmlContent, setXmlContent] = useState("");
  const { handleOpen: handlePreviewOpen, dialog: previewDialog } =
    useXmlPreviewDialog(tree.id, xmlContent);

  const handlePreviewXml = () => {
    try {
      const deployJson = buildDeployJson(
        tree.id,
        allTrees,
        rootAttrs,
        xmlDeclaration
      );
      const xml = buildJsonToXml(deployJson);
      setXmlContent(xml);
      handlePreviewOpen();
    } catch (error) {
      alert(`Failed to preview XML: ${error.message}`);
    }
  };

  const menuItems = [
    {
      label: "Export Tree",
      keybind: "",
      action: () => exportTree(tree.treeData, tree.id),
    },
    {
      label: "Preview XML",
      keybind: "",
      action: handlePreviewXml,
    },
    { divider: true },
    {
      label: "Rename",
      keybind: "",
      action: () => setIsRenamingTree(true),
    },
    {
      label: "Delete",
      keybind: "",
      action: () => showDeleteMenu(tree.id),
    },
    { divider: true },
    ...(!isEntryTree
      ? [
          {
            label: "Set as Default Tree",
            keybind: "",
            action: () => setEntryTreeId(tree.id),
          },
        ]
      : []),
    {
      label: `${currentManifest ? "Change Node Manifest" : "Set Node Manifest"}`,
      keybind: "",
      action: handleOpen,
    },
  ];

  return (
    <>
      <ContextMenu items={menuItems}>{children}</ContextMenu>
      {dialog}
      {previewDialog}
    </>
  );
}
