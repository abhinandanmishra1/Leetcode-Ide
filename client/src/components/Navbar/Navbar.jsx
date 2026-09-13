import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faSpinner, faRotateLeft, faCode } from "@fortawesome/free-solid-svg-icons";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";

const Navbar = ({
  language,
  setLanguage,
  onRun,
  onReset,
  isRunning,
}) => {
  return (
    <div className="bg-[#282828] border-b border-[#3e3e3e] px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none flex-shrink-0 h-[50px]">
      {/* Brand Title */}
      <div className="flex items-center space-x-2 text-white font-semibold tracking-wide text-base">
        <span className="text-[#ffa116] text-xl">
          <FontAwesomeIcon icon={faCode} />
        </span>
        <span className="text-gray-200 font-sans tracking-tight font-bold">LeetCode</span>
        <span className="text-[11px] bg-[#3a3a3a] text-gray-300 font-mono px-1.5 py-0.5 rounded font-medium">
          IDE
        </span>
      </div>

      {/* Center Controls: Language Selector & Reset */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <LanguageDropdown language={language} setLanguage={setLanguage} />

        {/* Reset to boilerplate button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          title="Reset code to default template"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-gray-300 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] rounded-md transition-colors disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-xs text-gray-400" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Action: Run Code Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-xs font-semibold text-white shadow transition-all ${
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
