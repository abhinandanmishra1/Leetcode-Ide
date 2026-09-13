import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faTimes,
  faSearch,
  faPlus,
  faTrash,
  faCopy,
  faCheck,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { normalizeCommand } from "../../utils/storage";

export const TemplatesModal = ({
  isOpen,
  onClose,
  allTemplates,
  onInsertTemplate,
  onSaveCustomTemplate,
  onDeleteCustomTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "create"
  const [copiedCmd, setCopiedCmd] = useState(null);

  // New template form state
  const [newCmd, setNewCmd] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCode, setNewCode] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return allTemplates;
    const q = searchQuery.toLowerCase();
    return allTemplates.filter(
      (t) =>
        t.command.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [allTemplates, searchQuery]);

  if (!isOpen) return null;

  const handleCopy = async (template) => {
    try {
      await navigator.clipboard.writeText(template.code);
      setCopiedCmd(template.command);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {}
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newCmd.trim() || !newName.trim() || !newCode.trim()) return;

    onSaveCustomTemplate({
      command: normalizeCommand(newCmd),
      name: newName.trim(),
      description: newDesc.trim() || "Custom template",
      code: newCode,
      isCustom: true,
    });

    setNewCmd("");
    setNewName("");
    setNewDesc("");
    setNewCode("");
    setActiveTab("browse");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden font-sans text-xs text-gray-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#333333] flex-shrink-0">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <span className="text-[#ffa116]">
              <FontAwesomeIcon icon={faBolt} />
            </span>
            <span>Slash Command Templates</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tabs */}
            <div className="flex items-center bg-[#141414] p-0.5 rounded-lg border border-[#333333]">
              <button
                type="button"
                onClick={() => setActiveTab("browse")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "browse" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Browse ({allTemplates.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "create" ? "bg-[#333333] text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                + New Template
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "browse" ? (
          <>
            {/* Search */}
            <div className="p-3 bg-[#1e1e1e] border-b border-[#333333] flex-shrink-0">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates e.g. /trie, /dsu, /segtree..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141414] border border-[#3e3e3e] text-white focus:outline-none focus:border-[#ffa116] transition-colors"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {filtered.map((tpl) => (
                <div
                  key={tpl.command}
                  className="flex flex-col p-3 rounded-lg bg-[#1e1e1e] border border-[#333333] hover:border-[#4a4a4a] space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <code className="bg-[#1b2b23] text-[#2cbb5d] border border-[#2cbb5d]/40 px-2 py-0.5 rounded font-mono font-bold text-xs">
                        {tpl.command}
                      </code>
                      <span className="font-semibold text-white text-xs">{tpl.name}</span>
                      {tpl.isCustom ? (
                        <span className="bg-[#2c2419] text-[#ffa116] border border-[#ffa116]/30 px-1.5 py-0.2 rounded text-[10px] font-mono">
                          Custom
                        </span>
                      ) : (
                        <span className="bg-[#222222] text-gray-400 px-1.5 py-0.2 rounded text-[10px]">
                          Built-in
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(tpl)}
                        title="Copy template code"
                        className="px-2 py-1 rounded bg-[#2d2d2d] hover:bg-[#383838] text-gray-300 hover:text-white transition-colors"
                      >
                        <FontAwesomeIcon icon={copiedCmd === tpl.command ? faCheck : faCopy} className="text-[10px] mr-1" />
                        <span>{copiedCmd === tpl.command ? "Copied" : "Copy"}</span>
                      </button>

                      {tpl.isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete custom template ${tpl.command}?`)) {
                              onDeleteCustomTemplate(tpl.command);
                            }
                          }}
                          title="Delete custom template"
                          className="px-2 py-1 rounded bg-[#2d2d2d] hover:bg-red-950/60 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onInsertTemplate(tpl.code);
                          onClose();
                        }}
                        className="px-3 py-1 rounded bg-[#2cbb5d] hover:bg-[#26a050] text-white font-semibold transition-colors shadow"
                      >
                        Insert
                      </button>
                    </div>
                  </div>

                  {tpl.description && (
                    <p className="text-[11px] text-gray-400 leading-relaxed">{tpl.description}</p>
                  )}

                  {/* Code Snippet Box */}
                  <pre className="p-2.5 rounded bg-[#141414] border border-[#2d2d2d] text-gray-300 font-mono text-[11px] overflow-x-auto max-h-28 leading-relaxed">
                    {tpl.code}
                  </pre>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Create Custom Template Form */
          <form onSubmit={handleCreateSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Command Shortcut <strong className="text-red-400">*</strong></label>
                <input
                  type="text"
                  value={newCmd}
                  onChange={(e) => setNewCmd(e.target.value)}
                  placeholder="e.g. /my_algo or /graph"
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#3e3e3e] text-white font-mono focus:outline-none focus:border-[#ffa116]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-medium">Template Name <strong className="text-red-400">*</strong></label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Graph BFS Traversal"
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#3e3e3e] text-white focus:outline-none focus:border-[#ffa116]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-medium">Description (Optional)</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description of this template"
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#3e3e3e] text-white focus:outline-none focus:border-[#ffa116]"
              />
            </div>

            <div className="space-y-1 flex-1">
              <label className="text-gray-300 font-medium">Code Template <strong className="text-red-400">*</strong></label>
              <textarea
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                rows={8}
                placeholder="Paste or write your reusable code template here..."
                className="w-full p-3 rounded-lg bg-[#141414] border border-[#3e3e3e] text-white font-mono focus:outline-none focus:border-[#ffa116] resize-y leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#333333]">
              <button
                type="button"
                onClick={() => setActiveTab("browse")}
                className="px-3 py-1.5 rounded-lg bg-[#333333] hover:bg-[#3e3e3e] text-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newCmd.trim() || !newName.trim() || !newCode.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#2cbb5d] hover:bg-[#26a050] text-white font-semibold shadow disabled:opacity-50 transition-colors"
              >
                Create Template
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TemplatesModal;
