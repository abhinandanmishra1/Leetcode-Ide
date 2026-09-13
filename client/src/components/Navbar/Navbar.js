import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faSpinner, faRotateLeft, faCode } from "@fortawesome/free-solid-svg-icons";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";
import ThemeDropdown from "../Dropdowns/ThemeDropdown";

const Navbar = ({
  language,
  setLanguage,
  theme,
  setTheme,
  onRun,
  onReset,
  isRunning,
}) => {
  return (
    <div className="bg-[#282828] border-b border-[#3e3e3e] px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Brand Title */}
      <div className="flex items-center space-x-2 text-white font-semibold tracking-wide text-base">
        <span className="text-[#ffa116] text-xl">
          <FontAwesomeIcon icon={faCode} />
        </span>
        <span className="text-gray-200">LeetCode</span>
        <span className="text-xs bg-[#3a3a3a] text-gray-300 font-mono px-2 py-0.5 rounded">
          IDE
        </span>
      </div>

      {/* Center / Controls */}
      <div className="flex items-center space-x-3">
        <LanguageDropdown language={language} setLanguage={setLanguage} />
        <ThemeDropdown theme={theme} setTheme={setTheme} />

        {/* Reset to boilerplate button */}
        <button
          onClick={onReset}
          disabled={isRunning}
          title="Reset code to default template"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-gray-300 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] rounded transition duration-150 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Action: Run Code */}
      <div className="flex items-center">
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded text-sm font-medium text-white shadow-sm transition duration-150 ${
            isRunning
              ? "bg-[#258547] cursor-not-allowed opacity-80"
              : "bg-[#2cbb5d] hover:bg-[#26a050] active:scale-95"
          }`}
        >
          {isRunning ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} className="text-xs" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
