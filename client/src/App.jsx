import React, { useState, useRef, useEffect, useCallback } from "react";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import ConsolePanel from "./components/Console/ConsolePanel";
import Navbar from "./components/Navbar/Navbar";
import SplitPane from "./components/SplitPane/SplitPane";
import SaveModal from "./components/SavedCodes/SaveModal";
import SnippetLibraryModal from "./components/Templates/SnippetLibraryModal";
import DEFAULT_TEMPLATES from "./components/Templates/defaultTemplates";
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
  getSavedProblems,
  saveProblem,
  deleteProblem,
  getCustomTemplates,
  saveCustomTemplate,
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
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState(false);

  // Saved collections state
  const [savedProblems, setSavedProblems] = useState(() => getSavedProblems());
  const [customTemplates, setCustomTemplates] = useState(() => getCustomTemplates());

  const saveTimeoutRef = useRef(null);
  const editorInstanceRef = useRef(null);

  // Synchronize activeCaseId if testCases change
  useEffect(() => {
    if (!testCases.some((c) => c.id === activeCaseId)) {
      setActiveCaseId(testCases[0]?.id || "1");
    }
  }, [testCases, activeCaseId]);

  // Combine default templates and custom templates
  const getAllTemplates = useCallback(() => {
    const map = new Map();
    DEFAULT_TEMPLATES.forEach((t) => map.set(t.command, t));
    customTemplates.forEach((t) => map.set(t.command, t));
    return Array.from(map.values());
  }, [customTemplates]);

  // Show temporary toast notification
  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // When language changes: load saved code & test cases for that language
  const handleLanguageChange = (newLang) => {
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

  // Save problem/snippet (and optionally register slash command)
  const handleSaveProblem = (problemData) => {
    const saved = saveProblem(problemData);
    if (saved) {
      setSavedProblems(getSavedProblems());

      if (problemData.command) {
        saveCustomTemplate({
          command: problemData.command,
          name: problemData.name,
          description: `Custom snippet for ${problemData.name}`,
          code: problemData.code,
          isCustom: true,
        });
        setCustomTemplates(getCustomTemplates());
        showToast(`Saved "${saved.name}" with command ${problemData.command}!`);
      } else {
        showToast(`Saved "${saved.name}" (ID: ${saved.id})!`);
      }
    }
  };

  // Load a saved problem into the active workspace
  const handleLoadProblem = (problem) => {
    const matchedLang = LANGUAGES.find((l) => l.id === problem.languageId) || language;
    setLanguage(matchedLang);
    saveLanguage(matchedLang);

    setCode(problem.code || "");
    saveCode(matchedLang.id, problem.code || "");

    const loadedCases = Array.isArray(problem.testCases) && problem.testCases.length > 0
      ? problem.testCases
      : DEFAULT_TESTCASES;

    setTestCases(loadedCases);
    saveTestCases(matchedLang.id, loadedCases);
    setActiveCaseId(loadedCases[0]?.id || "1");

    setResults(null);
    setOverallStatus(null);
    showToast(`Loaded "${problem.name}" into editor!`);
  };

  // Delete a saved problem
  const handleDeleteProblem = (id) => {
    deleteProblem(id);
    setSavedProblems(getSavedProblems());
    showToast("Snippet deleted.", "info");
  };

  // Insert template code directly into Monaco editor at cursor position
  const handleInsertTemplate = (templateCode) => {
    const editor = editorInstanceRef.current;
    if (editor) {
      const selection = editor.getSelection();
      editor.executeEdits("snippet-insert", [
        {
          range: selection,
          text: templateCode,
          forceMoveMarkers: true,
        },
      ]);
      editor.focus();
    } else {
      setCode((prev) => prev + "\n" + templateCode);
    }
    showToast("Snippet inserted into editor!");
  };

  // Run code against all configured test cases
  const handleRunCode = async () => {
    if (isRunning) return;

    setActiveTab("result");
    setIsRunning(true);
    setOverallStatus("Running...");
    setAlertMessage(null);

    saveCode(language.id, code);
    saveTestCases(language.id, testCases);

    try {
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

        let isPassed = false;
        let isWrongAnswer = false;

        if (statusId === 3) {
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
            isPassed = true;
            isWrongAnswer = false;
          }
        } else {
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
      {/* Top Navbar with Combined Save + Dropdown */}
      <Navbar
        language={language}
        setLanguage={handleLanguageChange}
        onRun={handleRunCode}
        onReset={handleResetCode}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        savedProblems={savedProblems}
        onLoadProblem={handleLoadProblem}
        onDeleteProblem={handleDeleteProblem}
        isRunning={isRunning}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-14 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg border text-xs font-medium flex items-center space-x-2 animate-in slide-in-from-top duration-200 ${
            toastMessage.type === "info"
              ? "bg-[#252525] border-gray-600 text-gray-200"
              : "bg-[#172e21] border-[#2cbb5d]/50 text-[#2cbb5d]"
          }`}
        >
          <span>{toastMessage.message}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

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
          getAllTemplates={getAllTemplates}
          editorInstanceRef={editorInstanceRef}
          onOpenSnippetsModal={() => setIsSnippetsModalOpen(true)}
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

      {/* Save Snippet / Code Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveProblem}
        currentLanguage={language}
        code={code}
        testCases={testCases}
      />

      {/* LeetCode Style Snippet Library Modal */}
      <SnippetLibraryModal
        isOpen={isSnippetsModalOpen}
        onClose={() => setIsSnippetsModalOpen(false)}
        allSnippets={getAllTemplates()}
        onInsertSnippet={handleInsertTemplate}
      />
    </div>
  );
}

export default App;
