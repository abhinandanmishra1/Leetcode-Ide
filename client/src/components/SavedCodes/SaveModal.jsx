import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faTimes, faCode, faBolt, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { normalizeId, normalizeCommand, getSavedProblems } from "../../utils/storage";

export const SaveModal = ({
  isOpen,
  onClose,
  onSave,
  currentLanguage,
  code,
  testCases,
}) => {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");

  const normalizedId = useMemo(() => normalizeId(name), [name]);
  const normalizedCmd = useMemo(() => (command.trim() ? normalizeCommand(command) : ""), [command]);

  const existingProblems = useMemo(() => getSavedProblems(), [isOpen]);
  const isDuplicate = useMemo(() => {
    return existingProblems.some((p) => p.id === normalizedId);
  }, [existingProblems, normalizedId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: normalizedId,
      name: name.trim(),
      command: normalizedCmd || null,
      languageId: currentLanguage?.id || 54,
      languageName: currentLanguage?.name || "C++",
      code,
      testCases,
    });

    setName("");
    setCommand("");
    onClose();
  };

  const lineCount = (code || "").split("\n").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-xl w-full max-w-md shadow-2xl overflow-hidden font-sans text-xs text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#333333]">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <span className="text-[#ffa116]">
              <FontAwesomeIcon icon={faFloppyDisk} />
            </span>
            <span>Save Snippet / Code</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Summary pill */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1a] border border-[#333333] text-gray-400">
            <span className="flex items-center space-x-1.5">
              <FontAwesomeIcon icon={faCode} className="text-xs text-[#2cbb5d]" />
              <strong className="text-gray-200">{currentLanguage?.name || "C++"}</strong>
            </span>
            <span>{lineCount} lines</span>
            <span>{testCases?.length || 0} testcases</span>
          </div>

          {/* Problem / Title Input */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-medium flex items-center justify-between">
              <span>Problem / Code Name <strong className="text-red-400">*</strong></span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dijkstra Shortest Path or Two Sum"
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#3e3e3e] text-white focus:outline-none focus:border-[#ffa116] transition-colors"
            />
            {/* Live Normalized ID Preview */}
            {normalizedId && (
              <div className="flex items-center space-x-1 text-[11px] text-gray-400 pt-0.5">
                <span>Unique ID:</span>
                <code className="bg-[#1e1e1e] text-[#ffa116] px-1.5 py-0.5 rounded font-mono font-semibold">
                  {normalizedId}
                </code>
              </div>
            )}
          </div>

          {/* Optional Slash Command Shortcut */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-medium flex items-center space-x-1">
                <FontAwesomeIcon icon={faBolt} className="text-[#ffa116] text-[10px]" />
                <span>Slash Command Shortcut (Optional)</span>
              </label>
              <span className="text-gray-500 text-[11px]">e.g. /dijkstra</span>
            </div>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g. /dijkstra or /trie (type in editor to expand)"
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#3e3e3e] text-white focus:outline-none focus:border-[#ffa116] font-mono transition-colors"
            />
            {normalizedCmd && (
              <p className="text-[11px] text-gray-400">
                Typing <code className="text-[#2cbb5d] font-mono">{normalizedCmd}</code> in editor will autocomplete this template.
              </p>
            )}
          </div>

          {/* Duplicate Warning */}
          {isDuplicate && (
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px]">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs flex-shrink-0" />
              <span>An item with this ID already exists. Saving will overwrite the previous version.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#333333] hover:bg-[#3e3e3e] text-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#2cbb5d] hover:bg-[#26a050] text-white font-semibold shadow disabled:opacity-50 transition-colors"
            >
              Save Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;
