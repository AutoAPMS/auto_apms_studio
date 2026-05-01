/**
 * Downloads XML content as a file.
 *
 * @param {string} xmlContent - The XML string to download.
 * @param {string} filename - Filename without extension.
 */
export async function downloadXml(xmlContent, filename) {
  if (!xmlContent) {
    console.warn("No XML content to download");
    return;
  }

  if (window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${filename}.xml`,
        types: [
          {
            description: "XML File",
            accept: { "application/xml": [".xml"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(xmlContent);
      await writable.close();
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }

  const blob = new Blob([xmlContent], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xml`;
  link.click();
  URL.revokeObjectURL(url);
}
