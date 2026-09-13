import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import CopyButton from "./CopyButton";

export const TestResultTab = ({
  results,
  isRunning,
  overallStatus,
  activeCaseId,
  setActiveCaseId,
}) => {
  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400 space-y-3 font-sans">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#2cbb5d]" />
        <p className="text-sm font-medium">Running all test cases in sandbox...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500 font-sans text-xs">
        <p>Run your code to see outputs, execution results, and correctness metrics here.</p>
      </div>
    );
  }

  const activeResult = results.find((r) => r.caseId === activeCaseId) || results[0];
  const maxRuntime = Math.max(
    0,
    ...results.map((r) => (r.time !== null && r.time !== undefined ? Math.round(r.time * 1000) : 0))
  );
  const maxMemory = Math.max(
    0,
    ...results.map((r) => (r.memory !== null && r.memory !== undefined ? r.memory : 0))
  );

  const isAllAccepted = results.every((r) => r.isPassed);

  // Status color logic
  const getStatusColor = (status) => {
    if (status === "Accepted") return "text-[#2cbb5d]";
    if (status === "Time Limit Exceeded") return "text-[#ffa116]";
    return "text-[#ef4743]"; // Wrong Answer, Compile Error, Runtime Error
  };

  const currentOverallStatus = overallStatus || (isAllAccepted ? "Accepted" : "Wrong Answer");

  return (
    <div className="flex flex-col h-full space-y-4 font-sans text-xs overflow-y-auto pr-1">
      {/* Big LeetCode Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2d2d2d] flex-shrink-0">
        <div className="flex items-center space-x-3">
          <span className={`text-xl font-bold tracking-tight ${getStatusColor(currentOverallStatus)}`}>
            {currentOverallStatus}
          </span>
          <span className="text-gray-400 text-xs">
            Runtime: <strong className="text-gray-200 font-mono">{maxRuntime} ms</strong>
          </span>
        </div>

        {maxMemory > 0 && (
          <span className="text-gray-400 text-xs">
            Memory: <strong className="text-gray-200 font-mono">{(maxMemory / 1024).toFixed(1)} MB</strong>
          </span>
        )}
      </div>

      {/* Case Pills Header (Case 1, Case 2...) - Wraps into rows without horizontal scrollbar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 flex-shrink-0 select-none">
        {results.map((res, idx) => {
          const isSelected = res.caseId === activeResult?.caseId;
          const passed = res.isPassed;
          return (
            <button
              key={res.caseId}
              type="button"
              onClick={() => setActiveCaseId(res.caseId)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                isSelected
                  ? "bg-[#333333] border-[#4a4a4a] text-white shadow-sm"
                  : "bg-[#222222] border-transparent text-gray-400 hover:bg-[#282828] hover:text-gray-200"
              }`}
            >
              <FontAwesomeIcon
                icon={passed ? faCheck : faTimes}
                className={`text-xs ${passed ? "text-[#2cbb5d]" : "text-[#ef4743]"}`}
              />
              <span>{res.name || `Case ${idx + 1}`}</span>
            </button>
          );
        })}
      </div>

      {/* Active Case Detail Cards */}
      {activeResult && (
        <div className="flex flex-col space-y-3 flex-1 pb-4">
          {/* Compile Error (if present) */}
          {activeResult.compileOutput && (
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-semibold text-xs">Compile Output:</span>
                <CopyButton text={activeResult.compileOutput} title="Copy compile error" />
              </div>
              <pre className="p-3 rounded-lg bg-[#2a1717] border border-red-900/60 text-red-300 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {activeResult.compileOutput}
              </pre>
            </div>
          )}

          {/* Runtime Error (if present) */}
          {activeResult.stderr && (
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-semibold text-xs">Runtime Error:</span>
                <CopyButton text={activeResult.stderr} title="Copy runtime error" />
              </div>
              <pre className="p-3 rounded-lg bg-[#2a1717] border border-red-900/60 text-red-300 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {activeResult.stderr}
              </pre>
            </div>
          )}

          {/* Input Box */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-medium">Input</span>
              {activeResult.input ? <CopyButton text={activeResult.input} title="Copy input" /> : null}
            </div>
            <pre className="p-3 rounded-lg bg-[#262626] border border-[#3e3e3e] text-gray-200 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {activeResult.input || <span className="text-gray-500 italic">None (empty stdin)</span>}
            </pre>
          </div>

          {/* Output Box */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-medium">Output</span>
              {activeResult.actualOutput ? (
                <CopyButton text={activeResult.actualOutput} title="Copy output" />
              ) : null}
            </div>
            <pre
              className={`p-3 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border ${
                activeResult.isWrongAnswer
                  ? "bg-[#2b1919] border-red-800/60 text-red-200"
                  : "bg-[#262626] border-[#3e3e3e] text-gray-200"
              }`}
            >
              {activeResult.actualOutput !== "" ? (
                activeResult.actualOutput
              ) : (
                <span className="text-gray-500 italic">No output produced</span>
              )}
            </pre>
          </div>

          {/* Expected Box (if provided) */}
          {activeResult.expected !== undefined && activeResult.expected !== "" && (
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-medium">Expected</span>
                <CopyButton text={activeResult.expected} title="Copy expected" />
              </div>
              <pre className="p-3 rounded-lg bg-[#262626] border border-[#3e3e3e] text-gray-200 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {activeResult.expected}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestResultTab;
