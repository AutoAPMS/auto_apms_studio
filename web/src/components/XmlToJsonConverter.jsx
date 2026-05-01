import { useState } from "react";
import { useStore } from "../store/treeStore.js";
import { parseXmlToJson } from "../services/xmlService.js";

export default function XmlToJsonConverter({ ref, onLoad }) {
  const setSavedJson = useStore((state) => state.setSavedJson);
  const [jsonData, setJsonData] = useState(null);
  const [originalName, setOriginalName] = useState("");
  const debugging = false;

  const handleFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setOriginalName(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const xmlText = reader.result;
        const jsonObject = parseXmlToJson(xmlText);
        setJsonData(jsonObject);
        setSavedJson(jsonObject);
        onLoad?.();
        window.location.reload();
        console.log("file uploaded and parsed");
      } catch (error) {
        console.error("Error parsing XML:", error);
        alert("Failed to parse XML file. Please check the file format.");
      }
    };

    reader.readAsText(file);
  };

  /**
   * Creates a downloadable JSON file from the parsed XML content.
   *
   * This function is intended primarily for testing and debugging.
   *
   * @throws {Error} If no JSON data is available to download.
   */
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${originalName || "file"}_converted.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* HIDDEN INPUT */}
      <input
        type="file"
        accept=".xml"
        ref={ref}
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {/* DOWNLOAD BUTTON - only show after conversion-only needed for debugging*/}
      {jsonData && debugging && (
        <button
          onClick={downloadJSON}
          style={{
            padding: "8px 14px",
            background: "#007bff",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          Download JSON
        </button>
      )}
    </div>
  );
}
