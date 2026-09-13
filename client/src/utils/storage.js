import { INITIAL_SEEDED_TEMPLATES } from "../components/Templates/defaultTemplates";
import { boilerCodes } from "../boilerCodes";

// CodePad storage keys (with legacy leetcode_ide_* fallbacks)
export const CODE_PREFIX = "codepad_code_";
export const LEGACY_CODE_PREFIX = "leetcode_ide_code_";

export const STDIN_PREFIX = "codepad_stdin_";
export const LEGACY_STDIN_PREFIX = "leetcode_ide_stdin_";

export const TESTCASES_PREFIX = "codepad_testcases_";
export const LEGACY_TESTCASES_PREFIX = "leetcode_ide_testcases_";

export const LAST_LANG_KEY = "codepad_last_lang";
export const LEGACY_LAST_LANG_KEY = "leetcode_ide_last_lang";

export const LAST_THEME_KEY = "codepad_last_theme";
export const LEGACY_LAST_THEME_KEY = "leetcode_ide_last_theme";

export const SAVED_PROBLEMS_KEY = "codepad_saved_problems";
export const LEGACY_SAVED_PROBLEMS_KEY = "leetcode_ide_saved_problems";

export const TEMPLATES_KEY = "codepad_templates";
export const LEGACY_TEMPLATES_KEY = "leetcode_ide_templates";

export const TEMPLATES_SEEDED_KEY = "codepad_templates_seeded_v3";
export const LEGACY_TEMPLATES_SEEDED_KEY = "leetcode_ide_templates_seeded";

export const DEFAULT_TESTCASES = [
  {
    id: "1",
    name: "Case 1",
    input: "5\nhello\n1 2 3 4 5",
    expected: "Number: 5\nString: hello\nArray: 1 2 3 4 5",
  },
];

/**
 * Normalizes a user-provided name to a unique identifier:
 * Replaces spaces with "_", strips invalid characters, lowercases.
 * e.g., "Two Sum Solution" -> "two_sum_solution"
 */
export const normalizeId = (name) => {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "_");
};

/**
 * Normalizes a slash command shortcut:
 * Ensures it starts with "/" and contains only valid command characters.
 * e.g., "trie" -> "/trie", "/dsu" -> "/dsu"
 */
export const normalizeCommand = (cmd) => {
  if (!cmd) return "";
  const cleaned = cmd.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

/**
 * Helper to get an item from localStorage with transparent legacy fallback and migration.
 * 1. Checks newKey first. If a non-null, non-empty value is found, returns it.
 * 2. If newKey is null or empty, checks legacyKey (if provided).
 * 3. If legacyKey has a non-null, non-empty value, migrates it to newKey and returns it.
 * 4. Otherwise returns the value from newKey (or null).
 */
export const getItemWithFallback = (newKey, legacyKey) => {
  try {
    const newVal = localStorage.getItem(newKey);
    if (newVal !== null) {
      return newVal;
    }
    if (legacyKey) {
      const legacyVal = localStorage.getItem(legacyKey);
      if (legacyVal !== null) {
        try {
          localStorage.setItem(newKey, legacyVal);
        } catch (e) {
          // localStorage quota or security error
        }
        return legacyVal;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const getSavedCode = (languageId, defaultCode = "") => {
  try {
    const saved = getItemWithFallback(
      `${CODE_PREFIX}${languageId}`,
      `${LEGACY_CODE_PREFIX}${languageId}`
    );
    if (!saved) return defaultCode;

    // Auto-migrate outdated boilerplate templates to the new strictly validated version
    const numId = Number(languageId);
    const isOutdatedJsTs =
      (numId === 63 || numId === 74) &&
      (saved.includes("function getNumInput") || saved.includes("_inputTokens")) &&
      !saved.includes("class Scanner");

    const isOutdatedCpp =
      numId === 54 &&
      saved.includes("readInt()");

    const isOutdatedC =
      numId === 50 &&
      saved.includes("readInt()");

    if (isOutdatedJsTs || isOutdatedCpp || isOutdatedC) {
      const fresh = boilerCodes(languageId);
      saveCode(languageId, fresh);
      return fresh;
    }

    return saved;
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
    localStorage.removeItem(`${LEGACY_CODE_PREFIX}${languageId}`);
  } catch (e) {}
};

export const getSavedStdin = (languageId) => {
  try {
    return (
      getItemWithFallback(
        `${STDIN_PREFIX}${languageId}`,
        `${LEGACY_STDIN_PREFIX}${languageId}`
      ) || ""
    );
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
    const saved = getItemWithFallback(
      `${TESTCASES_PREFIX}${languageId}`,
      `${LEGACY_TESTCASES_PREFIX}${languageId}`
    );
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const legacyStdin = getSavedStdin(languageId);
    return [
      {
        id: "1",
        name: "Case 1",
        input: legacyStdin || "5\nhello\n1 2 3 4 5",
        expected: "Number: 5\nString: hello\nArray: 1 2 3 4 5",
      },
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
    localStorage.removeItem(`${LEGACY_TESTCASES_PREFIX}${languageId}`);
  } catch (e) {}
};

export const getSavedLanguage = (defaultLang) => {
  try {
    const saved = getItemWithFallback(LAST_LANG_KEY, LEGACY_LAST_LANG_KEY);
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

export const getSavedTheme = (defaultTheme = "leetcode-dark") => {
  try {
    const saved = getItemWithFallback(LAST_THEME_KEY, LEGACY_LAST_THEME_KEY);
    if (!saved) return defaultTheme;
    try {
      return JSON.parse(saved);
    } catch {
      return saved;
    }
  } catch (e) {
    return defaultTheme;
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(LAST_THEME_KEY, JSON.stringify(theme));
  } catch (e) {}
};

// ============================================================
// SAVED PROBLEMS / CODES MANAGER
// ============================================================

export const getSavedProblems = () => {
  try {
    const raw = getItemWithFallback(SAVED_PROBLEMS_KEY, LEGACY_SAVED_PROBLEMS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
};

export const getSavedProblem = (id) => {
  const list = getSavedProblems();
  return list.find((p) => p.id === id) || null;
};

export const saveProblem = (problem) => {
  try {
    const list = getSavedProblems();
    const id = problem.id || normalizeId(problem.name);
    const existingIndex = list.findIndex((p) => p.id === id);

    const now = Date.now();
    const savedItem = {
      ...problem,
      id,
      name: problem.name || id,
      updatedAt: now,
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : now,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = savedItem;
    } else {
      list.unshift(savedItem);
    }

    localStorage.setItem(SAVED_PROBLEMS_KEY, JSON.stringify(list));
    return savedItem;
  } catch (e) {
    console.warn("Failed to save problem to localStorage:", e);
    return null;
  }
};

export const deleteProblem = (id) => {
  try {
    const list = getSavedProblems().filter((p) => p.id !== id);
    localStorage.setItem(SAVED_PROBLEMS_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
};

// ============================================================
// LANGUAGE-SPECIFIC SLASH COMMAND TEMPLATES
// ============================================================

/**
 * Loads templates from localStorage.
 * Seeds INITIAL_SEEDED_TEMPLATES on first run only.
 * If languageId is provided, returns templates for that language.
 */
export const getTemplates = (languageId) => {
  try {
    const raw = getItemWithFallback(TEMPLATES_KEY, LEGACY_TEMPLATES_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    // Only return user-created custom templates, purge seeded templates
    const list = existing.filter(
      (t) =>
        !t.id?.startsWith("boilerplate_") &&
        !t.id?.startsWith("binarysearch_") &&
        !t.id?.startsWith("segtree_") &&
        !t.id?.startsWith("dsu_") &&
        !t.id?.startsWith("bitmask_dp_") &&
        !t.command?.toLowerCase().includes("fib")
    );
    if (list.length !== existing.length) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
    }

    if (languageId) {
      return list.filter((t) => !t.languageId || t.languageId === languageId);
    }
    return list;
  } catch {
    return [];
  }
};

export const findExistingTemplate = (command, languageId) => {
  if (!command) return null;
  const normCmd = normalizeCommand(command);
  const all = getTemplates();
  return all.find((t) => t.command === normCmd && (!t.languageId || t.languageId === languageId)) || null;
};

export const saveTemplate = (template) => {
  try {
    const normCmd = normalizeCommand(template.command);
    const all = getTemplates(); // all languages

    const existingIndex = all.findIndex(
      (t) => t.command === normCmd && t.languageId === template.languageId
    );

    const item = {
      ...template,
      command: normCmd,
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      all[existingIndex] = item;
    } else {
      all.unshift(item);
    }

    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
    return item;
  } catch (e) {
    console.warn("Failed to save template to localStorage:", e);
    return null;
  }
};

export const deleteTemplate = (command, languageId) => {
  try {
    const normCmd = normalizeCommand(command);
    const all = getTemplates(); // all languages
    const filtered = all.filter(
      (t) => !(t.command === normCmd && (!languageId || t.languageId === languageId))
    );
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    return false;
  }
};

export const getCustomTemplates = getTemplates;
export const saveCustomTemplate = saveTemplate;
export const deleteCustomTemplate = deleteTemplate;

const storageService = {
  normalizeId,
  normalizeCommand,
  getItemWithFallback,
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
  getSavedProblems,
  getSavedProblem,
  saveProblem,
  deleteProblem,
  getTemplates,
  findExistingTemplate,
  saveTemplate,
  deleteTemplate,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  CODE_PREFIX,
  LEGACY_CODE_PREFIX,
  STDIN_PREFIX,
  LEGACY_STDIN_PREFIX,
  TESTCASES_PREFIX,
  LEGACY_TESTCASES_PREFIX,
  LAST_LANG_KEY,
  LEGACY_LAST_LANG_KEY,
  LAST_THEME_KEY,
  LEGACY_LAST_THEME_KEY,
  SAVED_PROBLEMS_KEY,
  LEGACY_SAVED_PROBLEMS_KEY,
  TEMPLATES_KEY,
  LEGACY_TEMPLATES_KEY,
  TEMPLATES_SEEDED_KEY,
  LEGACY_TEMPLATES_SEEDED_KEY,
};

export default storageService;
