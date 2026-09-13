import React, { useState, useRef } from "react";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import ConsolePanel from "./components/Console/ConsolePanel";
import Navbar from "./components/Navbar/Navbar";
import { LANGUAGES } from "./constants/languages";
import { boilerCodes } from "./boilerCodes";
import { submitCode, checkStatus } from "./api";
import {
  getSavedCode,
  saveCode,
  resetSavedCode,
  getSavedStdin,
  saveStdin,
  getSavedLanguage,
  saveLanguage,
  getSavedTheme,
  saveTheme,
} from "./utils/storage";

function App() {
  const defaultLanguage = LANGUAGES[0]; // C++ (id: 54) or first language

  const [language, setLanguage] = useState(() => getSavedLanguage(defaultLanguage));
  const [theme, setTheme] = useState(() => getSavedTheme("vs-dark"));
  const [code, setCode] = useState(() => getSavedCode(language.id, boilerCodes(language.id)));
  const [testInput, setTestInput] = useState(() => getSavedStdin(language.id));

  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Debounce timer for auto-saving code and testInput
  const saveTimeoutRef = useRef(null);

  // When language changes: load saved code/stdin for the new language
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    saveLanguage(newLang);

    const savedCodeForNewLang = getSavedCode(newLang.id, boilerCodes(newLang.id));
    setCode(savedCodeForNewLang);

    const savedStdinForNewLang = getSavedStdin(newLang.id);
    setTestInput(savedStdinForNewLang);
  };

  // Handle code change with auto-save to localStorage
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveCode(language.id, newCode);
    }, 300);
  };

  // Handle stdin change with auto-save to localStorage
  const handleTestInputChange = (newStdin) => {
    setTestInput(newStdin);
    saveStdin(language.id, newStdin);
  };

  // Theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  // Reset to boilerplate
  const handleResetCode = () => {
    const confirmed = window.confirm("Reset code to default template? Any unsaved edits will be replaced.");
    if (confirmed) {
      resetSavedCode(language.id);
      const defaultBoiler = boilerCodes(language.id);
      setCode(defaultBoiler);
      saveCode(language.id, defaultBoiler);
    }
  };

  // Run code execution
  const handleRunCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setStatus("Running");
    setAlertMessage(null);

    // Save latest code immediately
    saveCode(language.id, code);
    saveStdin(language.id, testInput);

    try {
      const payload = {
        language_id: language.id,
        source_code: btoa(code),
        stdin: btoa(testInput || ""),
      };

      const submitRes = await submitCode(payload);

      if (!submitRes.success) {
        setIsRunning(false);
        setStatus("Error");

        if (submitRes.status === 429) {
          setAlertMessage("Rate limit exceeded. Please wait a moment before submitting again.");
        } else {
          setAlertMessage(submitRes.err || "Failed to submit code to execution server.");
        }
        return;
      }

      const token = submitRes.data?.token;
      if (!token) {
        setIsRunning(false);
        setStatus("Error");
        setAlertMessage("No execution token received.");
        return;
      }

      // Poll status
      const statusRes = await checkStatus(token);

      if (statusRes.success) {
        setOutput(statusRes.data);
        setStatus(statusRes.data.status?.description || "Finished");
      } else {
        setStatus("Error");
        setAlertMessage(statusRes.err || "Failed while polling execution result.");
      }
    } catch (err) {
      setStatus("Error");
      setAlertMessage(err.message || "An unexpected error occurred during execution.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#1a1a1a] text-gray-200 overflow-hidden font-sans">
      {/* Navbar */}
      <Navbar
        language={language}
        setLanguage={handleLanguageChange}
        theme={theme}
        setTheme={handleThemeChange}
        onRun={handleRunCode}
        onReset={handleResetCode}
        isRunning={isRunning}
      />

      {/* Alert Notification Banner if any */}
      {alertMessage && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-300 text-xs px-4 py-2 flex items-center justify-between select-none">
          <span>{alertMessage}</span>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-red-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Split Layout: Editor on Left, Console on Right */}
      <div className="flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-50px)] overflow-hidden">
        {/* Left Side: Monaco Editor */}
        <div className="flex flex-col w-full md:w-3/5 h-1/2 md:h-full overflow-hidden border-r border-[#333333]">
          <CodeEditor
            theme={theme}
            code={code}
            setCode={handleCodeChange}
            language={language}
          />
        </div>

        {/* Right Side: Interactive LeetCode Console (Testcase & Results) */}
        <div className="flex flex-col w-full md:w-2/5 h-1/2 md:h-full overflow-hidden">
          <ConsolePanel
            testInput={testInput}
            setTestInput={handleTestInputChange}
            output={output}
            status={status}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
