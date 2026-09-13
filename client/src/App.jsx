import React, { useState, useRef, useEffect } from "react";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import ConsolePanel from "./components/Console/ConsolePanel";
import Navbar from "./components/Navbar/Navbar";
import SplitPane from "./components/SplitPane/SplitPane";
import { LANGUAGES } from "./constants/languages";
import { boilerCodes } from "./boilerCodes";
import { submitCode } from "./api";
import {
  getSavedCode,
  saveCode,
  resetSavedCode,
  getSavedTestCases,
  saveTestCases,
  getSavedLanguage,
  saveLanguage,
} from "./utils/storage";

// Safe base64 decoding helper
const decodeBase64 = (val) => {
  if (!val) return "";
  try {
    return atob(val);
  } catch {
    return val;
  }
};

// Safe base64 encoding helper
const encodeBase64 = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str || "")));
  } catch {
    return btoa(str || "");
  }
};

function App() {
  const defaultLanguage = LANGUAGES[0]; // C++ (id: 54)

  const [language, setLanguage] = useState(() => getSavedLanguage(defaultLanguage));
  const [code, setCode] = useState(() => getSavedCode(language.id, boilerCodes(language.id)));
  const [testCases, setTestCases] = useState(() => getSavedTestCases(language.id));
  const [activeCaseId, setActiveCaseId] = useState(() => testCases[0]?.id || "1");

  const [activeTab, setActiveTab] = useState("testcase"); // "testcase" | "result"
  const [results, setResults] = useState(null);
  const [overallStatus, setOverallStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const saveTimeoutRef = useRef(null);

  // Synchronize activeCaseId if testCases change
  useEffect(() => {
    if (!testCases.some((c) => c.id === activeCaseId)) {
      setActiveCaseId(testCases[0]?.id || "1");
    }
  }, [testCases, activeCaseId]);

  // When language changes: load saved code & test cases for that language
  const handleLanguageChange = (newLang) => {
    // Save current language state first
    saveCode(language.id, code);
    saveTestCases(language.id, testCases);

    setLanguage(newLang);
    saveLanguage(newLang);

    const savedCode = getSavedCode(newLang.id, boilerCodes(newLang.id));
    setCode(savedCode);

    const savedCases = getSavedTestCases(newLang.id);
    setTestCases(savedCases);
    setActiveCaseId(savedCases[0]?.id || "1");
    setResults(null);
    setOverallStatus(null);
  };

  // Handle code change with debounced auto-save
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveCode(language.id, newCode);
    }, 300);
  };

  // Add a new testcase tab
  const handleAddCase = () => {
    const nextNum = testCases.length + 1;
    const newCase = {
      id: Date.now().toString(),
      name: `Case ${nextNum}`,
      input: "",
      expected: "",
    };
    const updated = [...testCases, newCase];
    setTestCases(updated);
    setActiveCaseId(newCase.id);
    saveTestCases(language.id, updated);
  };

  // Remove a testcase tab
  const handleRemoveCase = (caseId) => {
    if (testCases.length <= 1) return;
    const updated = testCases.filter((c) => c.id !== caseId);
    setTestCases(updated);
    if (activeCaseId === caseId) {
      setActiveCaseId(updated[0]?.id || "1");
    }
    saveTestCases(language.id, updated);
  };

  // Update input or expected for a testcase
  const handleUpdateCase = (caseId, field, value) => {
    const updated = testCases.map((c) => (c.id === caseId ? { ...c, [field]: value } : c));
    setTestCases(updated);
    saveTestCases(language.id, updated);
  };

  // Reset code to boilerplate template
  const handleResetCode = () => {
    const confirmed = window.confirm("Reset code to default template? Any unsaved edits will be replaced.");
    if (confirmed) {
      resetSavedCode(language.id);
      const defaultBoiler = boilerCodes(language.id);
      setCode(defaultBoiler);
      saveCode(language.id, defaultBoiler);
    }
  };

  // Run code against all configured test cases
  const handleRunCode = async () => {
    if (isRunning) return;

    // Immediately switch to Test Result tab
    setActiveTab("result");
    setIsRunning(true);
    setOverallStatus("Running...");
    setAlertMessage(null);

    // Save latest edits immediately
    saveCode(language.id, code);
    saveTestCases(language.id, testCases);

    try {
      // Execute each testcase concurrently against the execution backend
      const executionPromises = testCases.map(async (tc) => {
        const payload = {
          language_id: language.id,
          source_code: encodeBase64(code),
          stdin: encodeBase64(tc.input || ""),
        };

        const res = await submitCode(payload, { wait: true });
        if (!res.success) {
          return {
            caseId: tc.id,
            name: tc.name,
            input: tc.input,
            expected: tc.expected,
            actualOutput: "",
            stderr: res.err || "Submission failed",
            compileOutput: "",
            status: { id: 13, description: "Internal Error" },
            time: null,
            memory: null,
            isPassed: false,
            isWrongAnswer: false,
          };
        }

        const data = res.data;
        const actualOutput = decodeBase64(data.stdout || "");
        const stderr = decodeBase64(data.stderr || "");
        const compileOutput = decodeBase64(data.compile_output || "");
        const statusId = data.status?.id;

        // Verification logic
        let isPassed = false;
        let isWrongAnswer = false;

        if (statusId === 3) {
          // Normal exit code 0
          const expectedTrimmed = (tc.expected || "").trim();
          const actualTrimmed = actualOutput.trim();

          if (expectedTrimmed !== "") {
            if (actualTrimmed === expectedTrimmed) {
              isPassed = true;
              isWrongAnswer = false;
            } else {
              isPassed = false;
              isWrongAnswer = true;
            }
          } else {
            // No expected output provided -> Accepted if exited 0
            isPassed = true;
            isWrongAnswer = false;
          }
        } else {
          // Compile error, runtime error, or TLE
          isPassed = false;
          isWrongAnswer = false;
        }

        return {
          caseId: tc.id,
          name: tc.name,
          input: tc.input,
          expected: tc.expected,
          actualOutput,
          stderr,
          compileOutput,
          status: data.status,
          time: data.time,
          memory: data.memory,
          isPassed,
          isWrongAnswer,
        };
      });

      const caseResults = await Promise.all(executionPromises);
      setResults(caseResults);

      // Compute aggregate overall status
      const hasCompileError = caseResults.some((r) => r.status?.id === 6);
      const hasRuntimeError = caseResults.some((r) => r.status?.id === 7 || r.status?.id === 11 || r.status?.id === 12);
      const hasTLE = caseResults.some((r) => r.status?.id === 5);
      const hasWrongAnswer = caseResults.some((r) => r.isWrongAnswer);
      const allPassed = caseResults.every((r) => r.isPassed);

      let computedStatus = "Accepted";
      if (hasCompileError) {
        computedStatus = "Compile Error";
      } else if (hasRuntimeError) {
        computedStatus = "Runtime Error";
      } else if (hasTLE) {
        computedStatus = "Time Limit Exceeded";
      } else if (hasWrongAnswer) {
        computedStatus = "Wrong Answer";
      } else if (!allPassed) {
        computedStatus = "Wrong Answer";
      }

      setOverallStatus(computedStatus);

      // If a case failed, switch activeCaseId to that failing case so user sees the issue immediately
      const firstFailing = caseResults.find((r) => !r.isPassed);
      if (firstFailing) {
        setActiveCaseId(firstFailing.caseId);
      }
    } catch (err) {
      setOverallStatus("Error");
      setAlertMessage(err.message || "An unexpected error occurred during execution.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#1a1a1a] text-gray-200 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        language={language}
        setLanguage={handleLanguageChange}
        onRun={handleRunCode}
        onReset={handleResetCode}
        isRunning={isRunning}
      />

      {/* Alert Notification Banner if any */}
      {alertMessage && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-300 text-xs px-4 py-2 flex items-center justify-between select-none flex-shrink-0">
          <span>{alertMessage}</span>
          <button
            type="button"
            onClick={() => setAlertMessage(null)}
            className="text-red-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dynamic Split Layout: Code Editor on Left, Console on Right */}
      <SplitPane minLeft={320} minRight={280} minTop={200} minBottom={180}>
        {/* Left / Top Pane: Code Editor */}
        <CodeEditor
          code={code}
          setCode={handleCodeChange}
          language={language}
        />

        {/* Right / Bottom Pane: Console Panel */}
        <ConsolePanel
          testCases={testCases}
          setTestCases={setTestCases}
          activeCaseId={activeCaseId}
          setActiveCaseId={setActiveCaseId}
          results={results}
          isRunning={isRunning}
          overallStatus={overallStatus}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddCase={handleAddCase}
          onRemoveCase={handleRemoveCase}
          onUpdateCase={handleUpdateCase}
        />
      </SplitPane>
    </div>
  );
}

export default App;
