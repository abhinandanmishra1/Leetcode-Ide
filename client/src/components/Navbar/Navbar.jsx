import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faSpinner,
  faRotateLeft,
  faFloppyDisk,
  faChevronDown,
  faSearch,
  faTrash,
  faArrowRight,
  faCloudArrowUp,
  faShareNodes,
  faCompass,
  faRightFromBracket,
  faUser,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import LanguageDropdown from "../Dropdowns/LanguageDropdown";
import { CodePadBrand } from "../Brand/CodePadLogo";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({
  language,
  setLanguage,
  onRun,
  onReset,
  onOpenSaveModal,
  onSaveToCloud,
  onShare,
  activeSnippetId,
  savedProblems = [],
  onLoadProblem,
  onDeleteProblem,
  isRunning,
  onOpenAuthModal,
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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
      {/* Brand Title & Quick Navigation */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <CodePadBrand />
        </Link>
        <div className="hidden lg:flex items-center space-x-1 pl-2 border-l border-[#3e3e3e]">
          <Link
            to="/ide"
            className="px-2.5 py-1 text-xs text-gray-300 hover:text-white rounded-md hover:bg-[#333333] transition-colors flex items-center space-x-1.5"
          >
            <FontAwesomeIcon icon={faCode} className="text-[11px] text-[#ffa116]" />
            <span>IDE</span>
          </Link>
          <Link
            to="/explore"
            className="px-2.5 py-1 text-xs text-gray-300 hover:text-white rounded-md hover:bg-[#333333] transition-colors flex items-center space-x-1.5"
          >
            <FontAwesomeIcon icon={faCompass} className="text-[11px] text-[#2cbb5d]" />
            <span>Explore</span>
          </Link>
        </div>
      </div>

      {/* Center Controls: Language Selector, Save, Cloud, Share, Reset */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        <LanguageDropdown language={language} setLanguage={setLanguage} />

        {/* Combined Local Save Button + Dropdown */}
        <div className="relative inline-flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={onOpenSaveModal}
            title="Save current code locally (Ctrl/Cmd+S)"
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs text-white bg-[#333333] hover:bg-[#3f3f3f] border border-[#4a4a4a] rounded-l-md transition-colors"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs text-[#ffa116]" />
            <span className="font-semibold hidden sm:inline">Save</span>
          </button>

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

          {/* Local Saved Codes Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-[#222222] border border-[#3e3e3e] rounded-lg shadow-2xl z-50 overflow-hidden text-xs text-gray-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 bg-[#1c1c1c] border-b border-[#333333] flex items-center justify-between">
                <span className="font-semibold text-white">Local Saved Codes</span>
                <span className="bg-[#2e2e2e] text-gray-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {savedProblems.length}
                </span>
              </div>

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

              <div className="max-h-60 overflow-y-auto divide-y divide-[#2d2d2d]">
                {filteredProblems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-[11px]">
                    {savedProblems.length === 0
                      ? "No saved codes yet."
                      : "No matching codes found."}
                  </div>
                ) : (
                  filteredProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className="p-2.5 hover:bg-[#2a2a2a] transition-colors flex items-center justify-between gap-2 group"
                    >
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
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 flex items-center space-x-2">
                          <span>{problem.languageName || "C++"}</span>
                          <span>•</span>
                          <span>{problem.testCases?.length || 0} cases</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${problem.name}"?`)) {
                              onDeleteProblem(problem.id);
                            }
                          }}
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

        {/* Share Button */}
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            title="Share snippet with unique link"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-white bg-[#333333] hover:bg-[#3f3f3f] border border-[#4a4a4a] rounded-md transition-colors"
          >
            <FontAwesomeIcon icon={faShareNodes} className="text-xs text-[#00b4d8]" />
            <span className="font-semibold hidden sm:inline">Share</span>
          </button>
        )}

        {/* Reset button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          title="Reset code to default boilerplate"
          className="flex items-center space-x-1 px-2 py-1.5 text-xs text-gray-300 bg-[#333333] hover:bg-[#3f3f3f] border border-[#444444] rounded-md transition-colors disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-xs text-gray-400" />
          <span className="hidden lg:inline">Reset</span>
        </button>
      </div>

      {/* Right Controls: Run Button & User Profile / Login */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 rounded-md text-xs font-semibold text-white shadow transition-all ${
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

        {/* User Authentication Menu */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center space-x-1.5 p-1 rounded-full hover:ring-2 hover:ring-[#ffa116] transition-all"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#4a4a4a]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#383838] flex items-center justify-center text-gray-300 font-bold text-xs border border-[#4a4a4a]">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#222222] border border-[#3e3e3e] rounded-lg shadow-2xl z-50 overflow-hidden text-xs text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-3 bg-[#1a1a1a] border-b border-[#333333]">
                  <div className="font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-[#ffa116]">@{user.username}</div>
                </div>
                <div className="p-1">
                  <Link
                    to={`/u/${user.username}`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-[#2f2f2f] transition-colors text-gray-200 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faUser} className="text-xs text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/explore"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-[#2f2f2f] transition-colors text-gray-200 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faCompass} className="text-xs text-gray-400" />
                    <span>Explore Feed</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded hover:bg-[#2f2f2f] transition-colors text-red-400 hover:text-red-300 text-left"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#383838] hover:bg-[#444444] text-white border border-[#4f4f4f] rounded-md transition-all shadow active:scale-95"
          >
            <FontAwesomeIcon icon={faUser} className="text-[11px] text-[#ffa116]" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
