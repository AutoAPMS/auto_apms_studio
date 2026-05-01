import { useRef, useState, useEffect, useMemo } from "react";
import { CodeXml, X, Copy, Check } from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";

SyntaxHighlighter.registerLanguage("xml", xml);

function buildSyntaxStyle() {
  const style = getComputedStyle(document.documentElement);
  return {
    hljs: {
      display: "block",
      overflowX: "auto",
      background: style.getPropertyValue("--input-field").trim(),
      color: style.getPropertyValue("--text-color").trim(),
    },
    "hljs-meta": { color: style.getPropertyValue("--syntax-tag").trim() },
    "hljs-tag": { color: style.getPropertyValue("--syntax-tag").trim() },
    "hljs-name": { color: style.getPropertyValue("--syntax-name").trim() },
    "hljs-attr": { color: style.getPropertyValue("--syntax-attr").trim() },
    "hljs-string": { color: style.getPropertyValue("--syntax-string").trim() },
    "hljs-comment": { color: style.getPropertyValue("--divider").trim() },
    "hljs-number": { color: style.getPropertyValue("--syntax-number").trim() },
  };
}

export function useXmlPreviewDialog(treeId, xmlContent) {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const syntaxStyle = useMemo(() => buildSyntaxStyle(), [theme]);

  const handleOpen = () => dialogRef.current?.showModal();

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dialog = (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box bg-input-field border border-divider p-0 max-w-3xl w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <div className="flex items-center gap-2 text-text">
            <CodeXml className="w-6 h-6" />
            <span className="font-semibold text-lg">XML PREVIEW</span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center text-white cursor-pointer hover:bg-highlight border border-transparent hover:border-divider rounded-md transition-colors"
            onClick={() => dialogRef.current?.close()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          <SyntaxHighlighter
            language="xml"
            style={syntaxStyle}
            showLineNumbers
            customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.75rem" }}
            lineNumberStyle={{
              color: "var(--text)",
              opacity: 0.4,
              minWidth: "2.5em",
              fontFamily: "monospace",
            }}
          >
            {xmlContent}
          </SyntaxHighlighter>
        </div>

        <div className="h-px bg-divider" />

        <div className="flex items-center justify-left gap-2 px-4 py-4">
          <button
            className="px-3 py-1 text-sm font-medium rounded-md cursor-pointer bg-green-600/80 border-2 border-green-800 text-white hover:bg-green-800 transition-colors"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 inline mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 inline mr-1" />
                Copy
              </>
            )}
          </button>
          <button
            className="px-2 h-8 flex items-center justify-center text-sm rounded-sm bg-input-field hover:bg-highlight border-0 cursor-pointer text-text transition-colors"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );

  return { handleOpen, dialog };
}
