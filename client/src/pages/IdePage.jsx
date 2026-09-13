import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor/CodeEditor";
import ConsolePanel from "../components/Console/ConsolePanel";
import Navbar from "../components/Navbar/Navbar";
import SplitPane from "../components/SplitPane/SplitPane";
import SaveModal from "../components/SavedCodes/SaveModal";
import ResetModal from "../components/ResetModal/ResetModal";
import SnippetLibraryModal from "../components/Templates/SnippetLibraryModal";
import ShareModal from "../components/Share/ShareModal";
import SharedBanner from "../components/SharedBanner/SharedBanner";
import AuthModal from "../components/Auth/AuthModal";
import { LANGUAGES } from "../constants/languages";
import { boilerCodes } from "../boilerCodes";
import { submitCode, snippetsApi, usersApi } from "../api";
import { useAuth } from "../context/AuthContext";
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
  getTemplates,
  saveTemplate,
  deleteTemplate,
  normalizeId,
} from "../utils/storage";

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

function IdePage() {
  const { snippetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const defaultLanguage = LANGUAGES[0]; // C++

  const [language, setLanguage] = useState(() => getSavedLanguage(defaultLanguage));
  const [code, setCode] = useState(() => getSavedCode(language.id, boilerCodes(language.id)));
  const [testCases, setTestCases] = useState(() => getSavedTestCases(language.id));
  const [activeCaseId, setActiveCaseId] = useState(() => testCases[0]?.id || "1");

  const [activeTab, setActiveTab] = useState("testcase");
  const [results, setResults] = useState(null);
  const [overallStatus, setOverallStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Cloud snippet & sharing state
  const [cloudSnippet, setCloudSnippet] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState(false);

  // Saved collections state
  const [savedProblems, setSavedProblems] = useState(() => getSavedProblems());
  const [templates, setTemplates] = useState(() => getTemplates());

  // Load all templates and sync user's cloud snippets on mount or login
  useEffect(() => {
    // Always reload all available templates
    setTemplates(getTemplates());

    // If user is logged in, fetch cloud snippets and merge with saved codes
    if (user?.username) {
      usersApi
        .getSnippets(user.username)
        .then((cloudList) => {
          if (!Array.isArray(cloudList)) return;
          const localList = getSavedProblems();
          const cloudItems = cloudList.map((s) => ({
            id: s.snippetId,
            name: s.title,
            command: s.description?.startsWith("/") ? s.description : null,
            languageId: s.languageId,
            languageName: s.languageName,
            code: s.code,
            testCases: s.testCases || [],
            updatedAt: new Date(s.updatedAt || s.createdAt).getTime(),
            isCloud: true,
            snippetId: s.snippetId,
          }));

          // Merge: cloud items and local items, avoiding duplicates by id
          const map = new Map();
          cloudItems.forEach((item) => map.set(item.id, item));
          localList.forEach((item) => {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
          });

          const merged = Array.from(map.values()).sort(
            (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
          );
          setSavedProblems(merged);
        })
        .catch(() => {
          // Fallback to local storage if network unavailable
        });
    }
  }, [user]);

  const saveTimeoutRef = useRef(null);
  const editorInstanceRef = useRef(null);

  // Show temporary toast notification
  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Synchronize activeCaseId if testCases change
  useEffect(() => {
    if (!testCases.some((c) => c.id === activeCaseId)) {
      setActiveCaseId(testCases[0]?.id || "1");
    }
  }, [testCases, activeCaseId]);

  // Load shared snippet from cloud if snippetId is in URL
  useEffect(() => {
    if (!snippetId) {
      setCloudSnippet(null);
      setIsReadOnly(false);
      return;
    }

    const fetchSnippet = async () => {
      try {
        const data = await snippetsApi.getById(snippetId);
        setCloudSnippet(data);
        setCurrentProblem({
          name: data.title,
          command: data.description?.startsWith("/") ? data.description : null,
          id: data.snippetId,
          isCloud: true,
        });

        // Find language matching snippet
        const matchedLang = LANGUAGES.find((l) => l.id === data.languageId) || language;
        setLanguage(matchedLang);
        setCode(data.code);

        if (Array.isArray(data.testCases) && data.testCases.length > 0) {
          setTestCases(data.testCases);
          setActiveCaseId(data.testCases[0].id || "1");
        }

        // Read-only if user is not the author
        const isAuthor = user && data.author && user.id === data.author.id;
        setIsReadOnly(!isAuthor);
      } catch (err) {
        showToast("Snippet not found or failed to load.", "info");
      }
    };

    fetchSnippet();
  }, [snippetId, user]);

  const getAllTemplates = useCallback(
    (langId) => {
      const targetId = langId || language?.id;
      return templates.filter((t) => !t.languageId || t.languageId === targetId);
    },
    [templates, language?.id]
  );

  // Handle language switch
  const handleLanguageChange = (newLang) => {
    if (!isReadOnly) {
      saveCode(language.id, code);
      saveTestCases(language.id, testCases);
    }

    setLanguage(newLang);
    saveLanguage(newLang);

    if (!isReadOnly) {
      const savedCode = getSavedCode(newLang.id, boilerCodes(newLang.id));
      setCode(savedCode);
      const savedCases = getSavedTestCases(newLang.id);
      setTestCases(savedCases);
      setActiveCaseId(savedCases[0]?.id || "1");
    }

    setResults(null);
    setOverallStatus(null);
  };

  // Handle code change with debounced save
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (!isReadOnly) {
        saveCode(language.id, newCode);
      }
    }, 300);
  };

  // Add / Remove / Update Testcase
  const handleAddCase = () => {
    if (testCases.length >= 8) {
      showToast("Maximum 8 test cases allowed.", "info");
      return;
    }
    const currentCase = testCases.find((c) => c.id === activeCaseId) || testCases[testCases.length - 1];
    if (currentCase && !currentCase.input?.trim()) {
      showToast("Please enter input in current case first.", "info");
      return;
    }

    const newCase = {
      id: Date.now().toString(),
      name: `Case ${testCases.length + 1}`,
      input: "",
      expected: "",
    };
    const updated = [...testCases, newCase].map((c, idx) => ({ ...c, name: `Case ${idx + 1}` }));
    setTestCases(updated);
    setActiveCaseId(newCase.id);
  };

  const handleRemoveCase = (caseId) => {
    if (testCases.length <= 1) return;
    const remaining = testCases.filter((c) => c.id !== caseId);
    const updated = remaining.map((c, idx) => ({ ...c, name: `Case ${idx + 1}` }));
    setTestCases(updated);
    if (activeCaseId === caseId) {
      setActiveCaseId(updated[0]?.id || "1");
    }
  };

  const handleUpdateCase = (caseId, field, value) => {
    const updated = testCases.map((c) => (c.id === caseId ? { ...c, [field]: value } : c));
    setTestCases(updated);
  };

  // Reset code to boilerplate template
  const handleConfirmReset = () => {
    resetSavedCode(language.id);
    const defaultBoiler = boilerCodes(language.id);
    setCode(defaultBoiler);
    saveCode(language.id, defaultBoiler);
    setCurrentProblem(null);
    setCloudSnippet(null);
    showToast(`Reset code to template for ${language.name}!`);
    if (snippetId) {
      navigate("/ide", { replace: true });
    }
  };

  // Save to MongoDB Cloud
  const handleSaveToCloud = async () => {
    try {
      const payload = {
        title: cloudSnippet?.title || `${language.name} Solution`,
        languageId: language.id,
        languageName: language.name,
        code,
        testCases,
        isPublic: true,
      };

      if (cloudSnippet && user && cloudSnippet.author?.id === user.id) {
        // Update existing owned snippet
        const updated = await snippetsApi.update(cloudSnippet.snippetId, payload);
        setCloudSnippet(updated);
        showToast("Snippet updated on cloud!");
      } else {
        // Create new snippet
        const created = await snippetsApi.create(payload);
        setCloudSnippet(created);
        setIsReadOnly(false);
        showToast(`Saved to cloud! Snippet ID: ${created.snippetId}`);
        navigate(`/s/${created.snippetId}`, { replace: true });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save to cloud", "info");
    }
  };

  // Fork shared snippet
  const handleForkSnippet = async () => {
    if (!cloudSnippet) return;
    setIsForking(true);
    try {
      const forked = await snippetsApi.fork(cloudSnippet.snippetId);
      setCloudSnippet(forked);
      setCurrentProblem({
        name: forked.title,
        command: forked.description?.startsWith("/") ? forked.description : null,
        id: forked.snippetId,
        isCloud: true,
      });
      setIsReadOnly(false);
      showToast(`Forked! You now have your own editable copy.`);
      navigate(`/s/${forked.snippetId}`, { replace: true });
    } catch (err) {
      // Local fallback fork
      setIsReadOnly(false);
      setCurrentProblem({
        name: `${cloudSnippet.title} (Fork)`,
        command: null,
        id: normalizeId(`${cloudSnippet.title}_fork`),
      });
      showToast("Cloned code into your active editor!");
      navigate("/ide", { replace: true });
    } finally {
      setIsForking(false);
    }
  };

  // Open Share modal
  const handleOpenShare = () => {
    if (!cloudSnippet) {
      // Auto-save to cloud first to get a permanent URL
      handleSaveToCloud().then(() => {
        setIsShareModalOpen(true);
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  // Run code against test cases in the sandbox engine
  const handleRunCode = async () => {
    if (isRunning) return;

    setActiveTab("result");
    setIsRunning(true);
    setOverallStatus("Running...");
    setAlertMessage(null);

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
      const hasRuntimeError = caseResults.some((r) => [7, 11, 12].includes(r.status?.id));
      const hasTLE = caseResults.some((r) => r.status?.id === 5);
      const allPassed = caseResults.every((r) => r.isPassed);

      let computedStatus = "Accepted";
      if (hasCompileError) computedStatus = "Compile Error";
      else if (hasRuntimeError) computedStatus = "Runtime Error";
      else if (hasTLE) computedStatus = "Time Limit Exceeded";
      else if (!allPassed) computedStatus = "Wrong Answer";

      setOverallStatus(computedStatus);
    } catch (err) {
      setOverallStatus("Error");
      setAlertMessage(err.message || "An unexpected error occurred.");
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
        onReset={() => setIsResetModalOpen(true)}
        onOpenSaveModal={async () => {
          if (!user) {
            setIsAuthModalOpen(true);
            showToast("Please sign in with Google to save your code to cloud.", "info");
            return;
          }

          // If already saved with name, quick-save directly!
          if (currentProblem?.name || (cloudSnippet && cloudSnippet.author?.id === user.id)) {
            const saveName = currentProblem?.name || cloudSnippet?.title || `${language.name} Solution`;
            const saveCmd = currentProblem?.command || null;
            const problemData = {
              id: currentProblem?.id || (cloudSnippet ? normalizeId(cloudSnippet.title) : normalizeId(saveName)),
              name: saveName,
              command: saveCmd,
              languageId: language.id,
              languageName: language.name,
              code,
              testCases,
            };

            saveProblem(problemData);
            setSavedProblems(getSavedProblems());

            try {
              const payload = {
                title: saveName,
                description: saveCmd || "",
                languageId: language.id,
                languageName: language.name,
                code,
                testCases,
                isPublic: true,
              };

              if (cloudSnippet && cloudSnippet.author?.id === user.id) {
                const updated = await snippetsApi.update(cloudSnippet.snippetId, payload);
                setCloudSnippet(updated);
                setCurrentProblem({ name: updated.title, command: saveCmd, id: updated.snippetId, isCloud: true });
                showToast(`Saved changes to "${saveName}" on Cloud!`);
              } else {
                const created = await snippetsApi.create(payload);
                setCloudSnippet(created);
                setCurrentProblem({ name: created.title, command: saveCmd, id: created.snippetId, isCloud: true });
                showToast(`Saved "${saveName}" to Cloud!`);
                navigate(`/s/${created.snippetId}`, { replace: true });
              }
            } catch (err) {
              showToast(`Saved "${saveName}" locally.`, "info");
            }
          } else {
            setIsSaveModalOpen(true);
          }
        }}
        onShare={handleOpenShare}
        activeSnippetId={cloudSnippet?.snippetId || currentProblem?.id}
        activeSnippetName={currentProblem?.name || cloudSnippet?.title || ""}
        activeSnippetCommand={currentProblem?.command || (cloudSnippet?.description?.startsWith("/") ? cloudSnippet.description : "")}
        cloudSnippet={cloudSnippet}
        savedProblems={savedProblems}
        onLoadProblem={(p) => {
          const matchedLang = LANGUAGES.find((l) => l.id === p.languageId) || language;
          setLanguage(matchedLang);
          setCode(p.code || "");
          setTestCases(p.testCases || []);
          setCurrentProblem({
            name: p.name,
            command: p.command || null,
            id: p.id,
            isCloud: !!p.isCloud,
          });
          if (p.isCloud && p.snippetId) {
            navigate(`/s/${p.snippetId}`, { replace: true });
          } else {
            showToast(`Loaded "${p.name}" into editor!`);
          }
        }}
        onDeleteProblem={(id) => {
          deleteProblem(id);
          setSavedProblems((prev) => prev.filter((p) => p.id !== id));
          if (currentProblem?.id === id) {
            setCurrentProblem(null);
          }
          showToast("Snippet deleted.", "info");
        }}
        isRunning={isRunning}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Shared Snippet Read-Only Banner */}
      {cloudSnippet && isReadOnly && (
        <SharedBanner
          snippet={cloudSnippet}
          onFork={handleForkSnippet}
          isForking={isForking}
        />
      )}

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

      {/* Alert Banner */}
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

      {/* Main Dynamic Split Layout */}
      <SplitPane minLeft={320} minRight={280} minTop={200} minBottom={180}>
        <CodeEditor
          code={code}
          setCode={handleCodeChange}
          language={language}
          getAllTemplates={getAllTemplates}
          editorInstanceRef={editorInstanceRef}
          onOpenSnippetsModal={() => setIsSnippetsModalOpen(true)}
          readOnly={isReadOnly}
        />

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

      {/* Modals */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        initialName={currentProblem?.name || cloudSnippet?.title || ""}
        initialCommand={currentProblem?.command || (cloudSnippet?.description?.startsWith("/") ? cloudSnippet.description : "")}
        onSave={async (data) => {
          const saved = saveProblem(data);
          if (saved) {
            setSavedProblems(getSavedProblems());
          }
          setCurrentProblem({
            name: data.name,
            command: data.command || null,
            id: data.id,
            isCloud: !!user,
          });
          if (user) {
            try {
              const payload = {
                title: data.name || `${language.name} Solution`,
                description: data.command || "",
                languageId: data.languageId || language.id,
                languageName: data.languageName || language.name,
                code: data.code || code,
                testCases: data.testCases || testCases,
                isPublic: true,
              };
              if (cloudSnippet && cloudSnippet.author?.id === user.id) {
                const updated = await snippetsApi.update(cloudSnippet.snippetId, payload);
                setCloudSnippet(updated);
                setCurrentProblem({
                  name: updated.title,
                  command: data.command || null,
                  id: updated.snippetId,
                  isCloud: true,
                });
                showToast(`Saved "${data.name}" to Cloud!`);
              } else {
                const created = await snippetsApi.create(payload);
                setCloudSnippet(created);
                setCurrentProblem({
                  name: created.title,
                  command: data.command || null,
                  id: created.snippetId,
                  isCloud: true,
                });
                showToast(`Saved "${data.name}" to Cloud! (ID: ${created.snippetId})`);
                navigate(`/s/${created.snippetId}`, { replace: true });
              }
            } catch (err) {
              showToast(`Saved "${data.name}" locally.`, "info");
            }
          }
        }}
        currentLanguage={language}
        code={code}
        testCases={testCases}
      />

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        currentLanguage={language}
      />

      <SnippetLibraryModal
        isOpen={isSnippetsModalOpen}
        onClose={() => setIsSnippetsModalOpen(false)}
        allSnippets={getAllTemplates(language?.id)}
        currentLanguage={language}
        onInsertSnippet={(snippetCode) => {
          const editor = editorInstanceRef.current;
          if (editor && !isReadOnly) {
            const selection = editor.getSelection();
            editor.executeEdits("snippet-insert", [{ range: selection, text: snippetCode, forceMoveMarkers: true }]);
            editor.focus();
          } else if (!isReadOnly) {
            setCode((prev) => prev + "\n" + snippetCode);
          }
          showToast("Snippet inserted!");
        }}
        onDeleteSnippet={(cmd, langId) => {
          deleteTemplate(cmd, langId);
          setTemplates(getTemplates());
          showToast(`Deleted snippet "${cmd}".`, "info");
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        snippetId={cloudSnippet?.snippetId}
        title={cloudSnippet?.title}
        languageName={cloudSnippet?.languageName || language.name}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => showToast("Signed in successfully!")}
      />
    </div>
  );
}

export default IdePage;
