import { Copy, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
}

interface Selection {
  start: number;
  end: number;
  text: string;
}

export function App() {
  const [text, setText] = useState<string>("");
  const [entities, setEntities] = useState<Record<string, string>>({});
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
  });
  const [selection, setSelection] = useState<Selection>({
    start: 0,
    end: 0,
    text: "",
  });
  const [entityCounter, setEntityCounter] = useState<number>(1);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleClickOutside = () =>
      setContextMenu({ visible: false, x: 0, y: 0 });
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const selectedText = text.substring(start, end);

    if (selectedText.length > 0) {
      setSelection({ start, end, text: selectedText });
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
    } else {
      setContextMenu({ visible: false, x: 0, y: 0 });
    }
  };

const handleReplace = () => {
  const entityKey = `[entity-${entityCounter}]`;
  const newEntities = { ...entities, [entityKey]: selection.text };

  const regex = new RegExp(selection.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); 
  const newText = text.replace(regex, entityKey);

  setText(newText);
  setEntities(newEntities);
  setEntityCounter(entityCounter + 1);
  setContextMenu({ visible: false, x: 0, y: 0 });
};


  const handleRestoreAll = () => {
    let restoredText = text;
    Object.entries(entities).forEach(([key, value]) => {
      restoredText = restoredText.replaceAll(key, value);
    });

    setText(restoredText);
    setEntities({});
    setEntityCounter(1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-semibold text-white mb-2">
              Entity Replacer
            </h1>
            <p className="text-slate-300 text-sm">
              Right-click selected text to replace with entity placeholders
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-2.5 bg-slate-800 border border-slate-700 text-blue-400 rounded-lg hover:bg-slate-700 hover:border-blue-500 hover:text-blue-300 transition-all shadow-lg"
              title={copySuccess ? "Copied!" : "Copy Text"}
            >
              <Copy size={20} />
            </button>

            {Object.keys(entities).length > 0 && (
              <button
                onClick={handleRestoreAll}
                className="p-2.5 bg-slate-800 border border-slate-700 text-orange-400 rounded-lg hover:bg-slate-700 hover:border-orange-500 hover:text-orange-300 transition-all shadow-lg"
                title="Restore All Entities"
              >
                <RotateCcw size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onContextMenu={handleContextMenu}
                className="w-full h-96 p-4 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none resize-none font-mono text-sm placeholder-slate-500"
                placeholder="Type or paste your text here..."
              />

              {contextMenu.visible && (
                <div
                  className="fixed bg-slate-800 border border-purple-500 rounded-lg shadow-2xl p-1 z-50"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleReplace}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors whitespace-nowrap"
                  >
                    Replace with Entity
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-full">
              <h2 className="text-lg font-semibold text-white mb-3">
                Entity Map
              </h2>
              {Object.keys(entities).length === 0 ? (
                <p className="text-slate-400 text-sm">No entities yet</p>
              ) : (
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-2 text-purple-400 font-medium">
                          Entity
                        </th>
                        <th className="text-left py-2 px-2 text-purple-400 font-medium">
                          Original
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(entities).map(([key, value]) => (
                        <tr
                          key={key}
                          className="border-b border-slate-700/50 hover:bg-slate-700/30"
                        >
                          <td className="py-2 px-2 font-mono text-purple-300 align-top">
                            {key}
                          </td>
                          <td className="py-2 px-2 text-slate-300 break-words align-top">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
