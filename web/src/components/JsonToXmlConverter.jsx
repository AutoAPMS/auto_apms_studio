import { useState, useEffect } from "react";
import { buildJsonToXml } from "../services/xmlService.js";
import { applyEntryTreeIdToSavedJson } from "../services/jsonService.js";
import { downloadXml } from "../services/downloadService.js";

/**
 * JsonToXmlConverter
 *
 * A reusable button component that converts a JSON object into XML
 * and triggers a download of the XML file. The button can be fully
 * customized via `children` and `buttonProps`.
 *
 * If `autoDownload` is set to true, the XML file is downloaded
 * automatically as soon as the conversion is ready and the
 * component renders nothing.
 *
 * @param {Object} props
 * @param {Object} props.data - The JSON data to export. Can be null.
 * @param {string} props.filename - The filename for the downloaded XML (without extension).
 * @param {boolean} [props.autoDownload=false] - If true, automatically downloads the XML and renders no button.
 * @param {React.ReactNode} [props.children] - Optional custom button content.
 * @param {Object} [props.buttonProps] - Optional additional props for the `<button>` element.
 * @returns {JSX.Element|null} A button that downloads the JSON as XML when clicked, or null when autoDownload is enabled.
 */

export default function JsonToXmlConverter({
  data,
  entryTreeId,
  filename,
  children,
  buttonProps,
  autoDownload = false,
}) {
  const [xmlOutput, setXmlOutput] = useState("");

  useEffect(() => {
    if (!data) {
      setXmlOutput("");
      return;
    }

    try {
      const dataToConvert = entryTreeId
        ? applyEntryTreeIdToSavedJson(data, entryTreeId)
        : data;
      const xml = buildJsonToXml(dataToConvert);
      setXmlOutput(xml);
    } catch (err) {
      console.error("Failed to convert JSON to XML:", err);
      setXmlOutput("");
    }
  }, [data, entryTreeId]);

  useEffect(() => {
    if (autoDownload && xmlOutput) {
      void downloadXml(xmlOutput, filename);
    }
  }, [autoDownload, xmlOutput, filename]);

  if (autoDownload) {
    return null;
  }
  return (
    <button
      onClick={downloadXml}
      {...buttonProps}
      disabled={!data || !entryTreeId}
    >
      {children || "Export JSON to XML"}
    </button>
  );
}
