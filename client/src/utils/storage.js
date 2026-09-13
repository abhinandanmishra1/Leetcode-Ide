const CODE_PREFIX = "leetcode_ide_code_";
const STDIN_PREFIX = "leetcode_ide_stdin_";
const LAST_LANG_KEY = "leetcode_ide_last_lang";
const LAST_THEME_KEY = "leetcode_ide_last_theme";

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
  getSavedLanguage,
  saveLanguage,
  getSavedTheme,
  saveTheme,
};

export default storageService;
