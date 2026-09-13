import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faClock, faMicrochip, faTerminal, faKeyboard } from "@fortawesome/free-solid-svg-icons";

export const ConsolePanel = ({
  testInput,
  setTestInput,
  output,
  status,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState("result"); // "testcase" | "result"

  // Decode base64 strings if necessary
  const decode = (val) => {
    if (!val) return "";
    try {
      return atob(val);
    } catch {
      return val;
    }
  };

  const stdout = decode(output?.stdout);
  const stderr = decode(output?.stderr);
  const compileOutput = decode(output?.compile_output);
  const statusId = output?.status?.id;
  const statusDesc = output?.status?.description;

  const getStatusBadge = () => {
    if (isRunning || status === "Running" || status === "In Queue") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-400 border border-blue-800 animate-pulse">
          Running...
        </span>
      );
    }

    if (!output && !status) {
      return null;
    }

    if (statusId === 3) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2cbb5d]/15 text-[#2cbb5d] border border-[#2cbb5d]/30">
          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
          <span>Accepted</span>
        </span>
      );
    }

    if (statusId === 5) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30">
          <FontAwesomeIcon icon={faClock} className="text-xs" />
          <span>Time Limit Exceeded</span>
        </span>
      );
    }

    if (statusId === 6) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ef4743]/15 text-[#ef4743] border border-[#ef4743]/30">
          <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
          <span>Compile Error</span>
        </span>
      );
    }

    if (statusId === 7 || statusId === 11 || statusId === 12) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ef4743]/15 text-[#ef4743] border border-[#ef4743]/30">
          <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
          <span>Runtime Error</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
        {statusDesc || status || "Finished"}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-gray-200 border-t md:border-t-0 md:border-l border-[#333333]">
      {/* Console Tab Header */}
      <div className="flex items-center justify-between px-3 bg-[#222222] border-b border-[#333333] h-10 select-none">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("testcase")}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded transition duration-150 ${
              activeTab === "testcase"
                ? "bg-[#333333] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]"
            }`}
          >
            <FontAwesomeIcon icon={faKeyboard} className="text-xs" />
            <span>Testcase (stdin)</span>
          </button>

          <button
            onClick={() => setActiveTab("result")}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded transition duration-150 ${
              activeTab === "result"
                ? "bg-[#333333] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]"
            }`}
          >
            <FontAwesomeIcon icon={faTerminal} className="text-xs" />
            <span>Test Result</span>
          </button>
        </div>

        {/* Live Status indicator in header */}
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
        {activeTab === "testcase" ? (
          <div className="flex flex-col h-full space-y-2">
            <label className="text-gray-400 text-xs font-sans">
              Provide input for your program (passed to stdin):
            </label>
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter custom input here..."
              className="w-full flex-1 min-h-[140px] p-3 rounded bg-[#262626] border border-[#3e3e3e] text-gray-200 focus:outline-none focus:border-[#555555] resize-none font-mono text-xs leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-3">
            {/* Telemetry Bar */}
            {output && (output.time !== null || output.memory !== null) && (
              <div className="flex items-center space-x-4 text-xs font-sans text-gray-400 pb-2 border-b border-[#2d2d2d]">
                {output.time !== null && (
                  <span className="flex items-center space-x-1">
                    <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                    <span>Runtime:</span>
                    <strong className="text-gray-200 font-mono">
                      {Math.round(output.time * 1000)} ms
                    </strong>
                  </span>
                )}
                {output.memory !== null && (
                  <span className="flex items-center space-x-1">
                    <FontAwesomeIcon icon={faMicrochip} className="text-gray-500" />
                    <span>Memory:</span>
                    <strong className="text-gray-200 font-mono">
                      {(output.memory / 1024).toFixed(1)} MB
                    </strong>
                  </span>
                )}
              </div>
            )}

            {/* Output Display */}
            {isRunning ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-400 space-y-2 font-sans">
                <span className="animate-spin text-xl text-[#2cbb5d]">●</span>
                <p className="text-xs">Executing your code in the sandbox...</p>
              </div>
            ) : output ? (
              <div className="flex flex-col space-y-3">
                {/* Compile Error Output */}
                {compileOutput && (
                  <div className="space-y-1">
                    <span className="text-red-400 font-semibold text-xs">Compile Output:</span>
                    <pre className="p-3 rounded bg-[#2a1b1b] border border-red-900/50 text-red-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {compileOutput}
                    </pre>
                  </div>
                )}

                {/* Stderr Output */}
                {stderr && (
                  <div className="space-y-1">
                    <span className="text-red-400 font-semibold text-xs">Runtime Error:</span>
                    <pre className="p-3 rounded bg-[#2a1b1b] border border-red-900/50 text-red-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {stderr}
                    </pre>
                  </div>
                )}

                {/* Stdout Output */}
                {stdout && (
                  <div className="space-y-1">
                    <span className="text-gray-400 font-semibold text-xs">Standard Output:</span>
                    <pre className="p-3 rounded bg-[#262626] border border-[#3e3e3e] text-green-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {stdout}
                    </pre>
                  </div>
                )}

                {!compileOutput && !stderr && !stdout && (
                  <p className="text-gray-500 italic py-4">No output was produced by this execution.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-500 font-sans text-xs">
                <p>Run your code to see results and performance metrics here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;
