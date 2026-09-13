import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderOpen,
  faTimes,
  faSearch,
  faTrash,
  faArrowRight,
  faDownload,
  faBolt,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

export const SavedCodesModal = ({
  isOpen,
  onClose,
  savedProblems,
  onLoadProblem,
  onDeleteProblem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return savedProblems;
    const q = searchQuery.toLowerCase();
    return savedProblems.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.languageName && p.languageName.toLowerCase().includes(q)) ||
        (p.command && p.command.toLowerCase().includes(q))
    );
  }, [savedProblems, searchQuery]);

  if (!isOpen) return null;

  const handleExport = (problem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problem, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${problem.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      const date = new Date(ts);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#242424] border border-[#3e3e3e] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden font-sans text-xs text-gray-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#333333] flex-shrink-0">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <span className="text-[#ffa116]">
              <FontAwesomeIcon icon={faFolderOpen} />
            </span>
            <span>Saved Codes & Problems</span>
            <span className="text-[11px] bg-[#333333] text-gray-300 font-mono px-2 py-0.5 rounded-full ml-2">
              {savedProblems.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>

        {/* Search Bar */}
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
              placeholder="Search by title, unique ID, language, or /command..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141414] border border-[#3e3e3e] text-white focus:outline-none focus:border-[#ffa116] transition-colors"
            />
          </div>
        </div>

        {/* List of Saved Codes */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <FontAwesomeIcon icon={faFolderOpen} className="text-3xl text-gray-600" />
              <p className="text-sm font-medium">No saved codes found</p>
              <p className="text-[11px] text-gray-500">
                {searchQuery ? "Try a different search query" : "Click 'Save' in the navbar to save your current code & testcases."}
              </p>
            </div>
          ) : (
            filtered.map((problem) => (
              <div
                key={problem.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-[#333333] hover:border-[#444444] transition-all gap-3 group"
              >
                {/* Details */}
                <div className="flex flex-col space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="font-semibold text-white text-sm truncate">{problem.name}</span>
                    <code className="bg-[#2c2c2c] text-[#ffa116] px-1.5 py-0.5 rounded text-[11px] font-mono">
                      {problem.id}
                    </code>
                    {problem.command && (
                      <span className="bg-[#1b2b23] text-[#2cbb5d] border border-[#2cbb5d]/30 px-1.5 py-0.5 rounded text-[11px] font-mono flex items-center space-x-1">
                        <FontAwesomeIcon icon={faBolt} className="text-[9px]" />
                        <span>{problem.command}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                    <span className="flex items-center space-x-1">
                      <FontAwesomeIcon icon={faCode} className="text-xs text-blue-400" />
                      <span>{problem.languageName || "C++"}</span>
                    </span>
                    <span>•</span>
                    <span>{problem.testCases?.length || 0} testcases</span>
                    <span>•</span>
                    <span>{formatTime(problem.updatedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleExport(problem)}
                    title="Export JSON backup"
                    className="p-1.5 rounded-md bg-[#2d2d2d] hover:bg-[#383838] text-gray-300 hover:text-white transition-colors text-xs"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete saved code "${problem.name}" (${problem.id})?`)) {
                        onDeleteProblem(problem.id);
                      }
                    }}
                    title="Delete saved code"
                    className="p-1.5 rounded-md bg-[#2d2d2d] hover:bg-red-950/60 text-gray-400 hover:text-red-400 transition-colors text-xs"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadProblem(problem);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#2cbb5d] hover:bg-[#26a050] text-white font-semibold shadow transition-colors text-xs"
                  >
                    <span>Load</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedCodesModal;
