const CODE_PREFIX = "leetcode_ide_code_";
const STDIN_PREFIX = "leetcode_ide_stdin_";
const TESTCASES_PREFIX = "leetcode_ide_testcases_";
const LAST_LANG_KEY = "leetcode_ide_last_lang";
const LAST_THEME_KEY = "leetcode_ide_last_theme";

export const DEFAULT_TESTCASES = [
  { id: "1", name: "Case 1", input: "", expected: "" },
  { id: "2", name: "Case 2", input: "", expected: "" },
];

export const getSavedCode = (languageId, defaultCode = "") => {
  try {
    const saved = localStorage.getItem(`${CODE_PREFIX}${languageId}`);
    return saved !== null ? saved : defaultCode;
  } catch (e) {
    return defaultCode;
  }
};

export const saveCode = (languageId, code) => {
  try {
    localStorage.setItem(`${CODE_PREFIX}${languageId}`, code);
  } catch (e) {
    console.warn("LocalStorage quota exceeded or unavailable");
  }
};

export const resetSavedCode = (languageId) => {
  try {
    localStorage.removeItem(`${CODE_PREFIX}${languageId}`);
  } catch (e) {}
};

export const getSavedStdin = (languageId) => {
  try {
    return localStorage.getItem(`${STDIN_PREFIX}${languageId}`) || "";
  } catch (e) {
    return "";
  }
};

export const saveStdin = (languageId, stdin) => {
  try {
    localStorage.setItem(`${STDIN_PREFIX}${languageId}`, stdin);
  } catch (e) {}
};

export const getSavedTestCases = (languageId) => {
  try {
    const saved = localStorage.getItem(`${TESTCASES_PREFIX}${languageId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Migration fallback: check legacy stdin
    const legacyStdin = getSavedStdin(languageId);
    return [
      { id: "1", name: "Case 1", input: legacyStdin || "", expected: "" },
      { id: "2", name: "Case 2", input: "", expected: "" },
    ];
  } catch {
    return DEFAULT_TESTCASES;
  }
};

export const saveTestCases = (languageId, cases) => {
  try {
    localStorage.setItem(`${TESTCASES_PREFIX}${languageId}`, JSON.stringify(cases));
  } catch (e) {
    console.warn("LocalStorage quota exceeded or unavailable");
  }
};

export const resetSavedTestCases = (languageId) => {
  try {
    localStorage.removeItem(`${TESTCASES_PREFIX}${languageId}`);
  } catch (e) {}
};

export const getSavedLanguage = (defaultLang) => {
  try {
    const saved = localStorage.getItem(LAST_LANG_KEY);
    return saved ? JSON.parse(saved) : defaultLang;
  } catch (e) {
    return defaultLang;
  }
};

export const saveLanguage = (lang) => {
  try {
    localStorage.setItem(LAST_LANG_KEY, JSON.stringify(lang));
  } catch (e) {}
};

export const getSavedTheme = (defaultTheme = "vs-dark") => {
  try {
    return localStorage.getItem(LAST_THEME_KEY) || defaultTheme;
  } catch (e) {
    return defaultTheme;
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(LAST_THEME_KEY, theme);
  } catch (e) {}
};

const storageService = {
  getSavedCode,
  saveCode,
  resetSavedCode,
  getSavedStdin,
  saveStdin,
  getSavedTestCases,
  saveTestCases,
  resetSavedTestCases,
  getSavedLanguage,
  saveLanguage,
  getSavedTheme,
  saveTheme,
};

export default storageService;
