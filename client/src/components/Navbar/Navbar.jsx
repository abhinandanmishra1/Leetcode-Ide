import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faSpinner,
  faRotateLeft,
  faCode,
  faFloppyDisk,
  faChevronDown,
  faSearch,
  faTrash,
  faArrowRight,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";

const Navbar = ({
  language,
  setLanguage,
  onRun,
  onReset,
  onOpenSaveModal,
  savedProblems = [],
  onLoadProblem,
  onDeleteProblem,
  isRunning,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen]);

  const filteredProblems = savedProblems.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.languageName && p.languageName.toLowerCase().includes(q)) ||
      (p.command && p.command.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-[#282828] border-b border-[#3e3e3e] px-4 py-2 flex items-center justify-between gap-3 select-none flex-shrink-0 h-[50px] relative z-40">
      {/* Brand Title */}
      <div className="flex items-center space-x-2 text-white font-semibold tracking-wide text-base flex-shrink-0">
        <span className="text-[#ffa116] text-xl">
          <FontAwesomeIcon icon={faCode} />
        </span>
        <span className="text-gray-200 font-sans tracking-tight font-bold hidden sm:inline">LeetCode</span>
        <span className="text-[11px] bg-[#3a3a3a] text-gray-300 font-mono px-1.5 py-0.5 rounded font-medium">
          IDE
        </span>
      </div>

      {/* Center Controls: Language Selector, Unified Save Dropdown, Reset */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <LanguageDropdown language={language} setLanguage={setLanguage} />

        {/* Combined Save Button + Dropdown */}
        <div className="relative inline-flex items-center" ref={dropdownRef}>
          {/* Main Save Action */}
          <button
            type="button"
            onClick={onOpenSaveModal}
            title="Save current code and testcases (Ctrl/Cmd+S)"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs text-white bg-[#333333] hover:bg-[#3f3f3f] border border-[#4a4a4a] rounded-l-md transition-colors"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs text-[#ffa116]" />
            <span className="font-semibold">Save</span>
          </button>

          {/* Chevron Dropdown Toggle */}
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            title="View saved codes"
            className="px-2 py-1.5 text-xs text-gray-300 bg-[#333333] hover:bg-[#3f3f3f] border-t border-r border-b border-[#4a4a4a] rounded-r-md transition-colors hover:text-white"
          >
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`text-[10px] transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-[#222222] border border-[#3e3e3e] rounded-lg shadow-2xl z-50 overflow-hidden text-xs text-gray-200 animate-in fade-in zoom-in-95 duration-100">
              {/* Dropdown Header */}
              <div className="px-3 py-2 bg-[#1c1c1c] border-b border-[#333333] flex items-center justify-between">
                <span className="font-semibold text-white">Saved Codes</span>
                <span className="bg-[#2e2e2e] text-gray-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {savedProblems.length}
                </span>
              </div>

              {/* Quick Search */}
              <div className="p-2 border-b border-[#333333] bg-[#1a1a1a]">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"
                  />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search saved..."
                    className="w-full pl-7 pr-2 py-1 rounded bg-[#141414] border border-[#333333] text-gray-200 focus:outline-none focus:border-[#ffa116] text-[11px]"
                  />
                </div>
              </div>

              {/* Scrollable list */}
              <div className="max-h-60 overflow-y-auto divide-y divide-[#2d2d2d]">
                {filteredProblems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-[11px]">
                    {savedProblems.length === 0
                      ? "No saved codes yet. Click Save to create one."
                      : "No matching codes found."}
                  </div>
                ) : (
                  filteredProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className="p-2.5 hover:bg-[#2a2a2a] transition-colors flex items-center justify-between gap-2 group"
                    >
                      {/* Left: Info */}
                      <div
                        onClick={() => {
                          onLoadProblem(problem);
                          setDropdownOpen(false);
                        }}
                        className="cursor-pointer min-w-0 flex-1"
                      >
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="font-medium text-white truncate text-[12px] group-hover:text-[#ffa116] transition-colors">
                            {problem.name}
                          </span>
                          <code className="text-[10px] bg-[#1a1a1a] text-gray-400 px-1 py-0.2 rounded font-mono">
                            {problem.id}
                          </code>
                          {problem.command && (
                            <span className="text-[10px] bg-[#1c2c22] text-[#2cbb5d] border border-[#2cbb5d]/30 px-1 py-0.2 rounded font-mono">
                              {problem.command}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 flex items-center space-x-2">
                          <span>{problem.languageName || "C++"}</span>
                          <span>•</span>
                          <span>{problem.testCases?.length || 0} cases</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${problem.name}"?`)) {
                              onDeleteProblem(problem.id);
                            }
                          }}
                          title="Delete saved code"
                          className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onLoadProblem(problem);
                            setDropdownOpen(false);
                          }}
                          title="Load into editor"
                          className="px-2 py-1 bg-[#2cbb5d] hover:bg-[#26a050] text-white rounded font-medium text-[11px] transition-colors shadow"
                        >
                          <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset to boilerplate button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          title="Reset code to default template"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-gray-300 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] rounded-md transition-colors disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-xs text-gray-400" />
          <span className="hidden md:inline">Reset</span>
        </button>
      </div>

      {/* Action: Run Code Button */}
      <div className="flex items-center flex-shrink-0">
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-md text-xs font-semibold text-white shadow transition-all ${
            isRunning
              ? "bg-[#258547] cursor-not-allowed opacity-80"
              : "bg-[#2cbb5d] hover:bg-[#26a050] active:scale-95"
          }`}
        >
          {isRunning ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} className="text-[11px]" />
              <span>Run</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
