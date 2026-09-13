import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faSpinner,
  faRotateLeft,
  faCode,
  faFloppyDisk,
  faFolderOpen,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";

const Navbar = ({
  language,
  setLanguage,
  onRun,
  onReset,
  onOpenSaveModal,
  onOpenSavedCodesModal,
  onOpenTemplatesModal,
  savedCount = 0,
  isRunning,
}) => {
  return (
    <div className="bg-[#282828] border-b border-[#3e3e3e] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 select-none flex-shrink-0 h-[50px] overflow-x-auto">
      {/* Brand Title */}
      <div className="flex items-center space-x-2 text-white font-semibold tracking-wide text-base flex-shrink-0">
        <span className="text-[#ffa116] text-xl">
          <FontAwesomeIcon icon={faCode} />
        </span>
        <span className="text-gray-200 font-sans tracking-tight font-bold hidden xs:inline">LeetCode</span>
        <span className="text-[11px] bg-[#3a3a3a] text-gray-300 font-mono px-1.5 py-0.5 rounded font-medium">
          IDE
        </span>
      </div>

      {/* Center Controls: Language Selector, Save, Saved Codes, Templates, Reset */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
        <LanguageDropdown language={language} setLanguage={setLanguage} />

        {/* Save Problem / Code Button */}
        <button
          type="button"
          onClick={onOpenSaveModal}
          title="Save code and testcases with a unique name"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-gray-200 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] hover:border-[#555555] rounded-md transition-colors"
        >
          <FontAwesomeIcon icon={faFloppyDisk} className="text-xs text-[#ffa116]" />
          <span className="hidden sm:inline font-medium">Save</span>
        </button>

        {/* Saved Codes Library Button */}
        <button
          type="button"
          onClick={onOpenSavedCodesModal}
          title="View and load your saved codes and testcases"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-gray-200 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] hover:border-[#555555] rounded-md transition-colors"
        >
          <FontAwesomeIcon icon={faFolderOpen} className="text-xs text-blue-400" />
          <span className="hidden sm:inline font-medium">Saved</span>
          {savedCount > 0 && (
            <span className="bg-[#1e1e1e] text-gray-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {savedCount}
            </span>
          )}
        </button>

        {/* Slash Command Templates Button */}
        <button
          type="button"
          onClick={onOpenTemplatesModal}
          title="Browse and insert slash command templates (/trie, /dsu, etc.)"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-gray-200 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] hover:border-[#555555] rounded-md transition-colors"
        >
          <FontAwesomeIcon icon={faBolt} className="text-xs text-[#2cbb5d]" />
          <span className="hidden sm:inline font-medium">Templates</span>
        </button>

        {/* Reset to boilerplate button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          title="Reset code to default template"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-gray-300 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] rounded-md transition-colors disabled:opacity-50"
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
