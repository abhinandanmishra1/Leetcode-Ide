import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faTerminal } from "@fortawesome/free-solid-svg-icons";
import TestcaseTab from "./TestcaseTab";
import TestResultTab from "./TestResultTab";

export const ConsolePanel = ({
  testCases,
  setTestCases,
  activeCaseId,
  setActiveCaseId,
  results,
  isRunning,
  overallStatus,
  activeTab,
  setActiveTab,
  onAddCase,
  onRemoveCase,
  onUpdateCase,
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-gray-200 overflow-hidden">
      {/* Console Tab Header */}
      <div className="flex items-center justify-between px-3 bg-[#222222] border-b border-[#333333] h-10 select-none flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab("testcase")}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "testcase"
                ? "bg-[#333333] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]"
            }`}
          >
            <FontAwesomeIcon icon={faCheckSquare} className="text-xs text-[#2cbb5d]" />
            <span>Testcase</span>
          </button>

          <span className="text-gray-600 text-xs">|</span>

          <button
            type="button"
            onClick={() => setActiveTab("result")}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "result"
                ? "bg-[#333333] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]"
            }`}
          >
            <FontAwesomeIcon icon={faTerminal} className="text-xs text-[#2cbb5d]" />
            <span>Test Result</span>
          </button>
        </div>
      </div>

      {/* Console Tab Body */}
      <div className="flex-1 p-3 overflow-hidden">
        {activeTab === "testcase" ? (
          <TestcaseTab
            testCases={testCases}
            activeCaseId={activeCaseId}
            setActiveCaseId={setActiveCaseId}
            onAddCase={onAddCase}
            onRemoveCase={onRemoveCase}
            onUpdateCase={onUpdateCase}
          />
        ) : (
          <TestResultTab
            results={results}
            isRunning={isRunning}
            overallStatus={overallStatus}
            activeCaseId={activeCaseId}
            setActiveCaseId={setActiveCaseId}
          />
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;
