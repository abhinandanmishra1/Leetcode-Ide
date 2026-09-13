import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

export const TestcaseTab = ({
  testCases,
  activeCaseId,
  setActiveCaseId,
  onAddCase,
  onRemoveCase,
  onUpdateCase,
}) => {
  const activeCase = testCases.find((c) => c.id === activeCaseId) || testCases[0];

  return (
    <div className="flex flex-col h-full space-y-3 font-sans text-xs">
      {/* Case Tabs Row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-[#2d2d2d] select-none flex-shrink-0">
        {testCases.map((tc, idx) => {
          const isActive = tc.id === activeCase?.id;
          return (
            <div
              key={tc.id}
              onClick={() => setActiveCaseId(tc.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all border ${
                isActive
                  ? "bg-[#333333] border-[#4a4a4a] text-white shadow-sm"
                  : "bg-[#222222] border-transparent text-gray-400 hover:bg-[#282828] hover:text-gray-200"
              }`}
            >
              <span>{tc.name || `Case ${idx + 1}`}</span>
              {testCases.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCase(tc.id);
                  }}
                  title="Remove this testcase"
                  className="text-gray-500 hover:text-red-400 ml-1 transition-colors p-0.5"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Test Case Button */}
        {testCases.length < 8 && (
          <button
            type="button"
            onClick={onAddCase}
            title="Add another test case"
            className="flex items-center justify-center w-7 h-7 rounded-md bg-[#222222] hover:bg-[#333333] text-gray-400 hover:text-white transition-colors border border-transparent hover:border-[#444444]"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
          </button>
        )}
      </div>

      {/* Case Details */}
      {activeCase && (
        <div className="flex flex-col space-y-3 flex-1 overflow-y-auto pr-1">
          {/* Input Box */}
          <div className="flex flex-col space-y-1.5 flex-1 min-h-[120px]">
            <label className="text-gray-400 font-medium text-xs flex items-center justify-between">
              <span>Input (stdin)</span>
            </label>
            <textarea
              value={activeCase.input}
              onChange={(e) => onUpdateCase(activeCase.id, "input", e.target.value)}
              placeholder="Enter testcase input for this case..."
              className="w-full flex-1 min-h-[100px] p-3 rounded-lg bg-[#262626] border border-[#3e3e3e] text-gray-200 focus:outline-none focus:border-[#ffa116]/60 font-mono text-xs leading-relaxed resize-none transition-colors"
            />
          </div>

          {/* Expected Output Box */}
          <div className="flex flex-col space-y-1.5 flex-1 min-h-[100px]">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 font-medium text-xs">Expected Output (optional)</label>
              <span className="text-gray-500 text-[11px]">Compared against actual output</span>
            </div>
            <textarea
              value={activeCase.expected}
              onChange={(e) => onUpdateCase(activeCase.id, "expected", e.target.value)}
              placeholder="Enter expected stdout to verify correctness..."
              className="w-full flex-1 min-h-[80px] p-3 rounded-lg bg-[#262626] border border-[#3e3e3e] text-gray-200 focus:outline-none focus:border-[#ffa116]/60 font-mono text-xs leading-relaxed resize-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestcaseTab;
