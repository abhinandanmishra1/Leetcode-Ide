import { INITIAL_SEEDED_TEMPLATES } from "../components/Templates/defaultTemplates";

const CODE_PREFIX = "leetcode_ide_code_";
const STDIN_PREFIX = "leetcode_ide_stdin_";
const TESTCASES_PREFIX = "leetcode_ide_testcases_";
const LAST_LANG_KEY = "leetcode_ide_last_lang";
const SAVED_PROBLEMS_KEY = "leetcode_ide_saved_problems";
const TEMPLATES_KEY = "leetcode_ide_templates";
const TEMPLATES_SEEDED_KEY = "leetcode_ide_templates_seeded_v2";

export const DEFAULT_TESTCASES = [
  { id: "1", name: "Case 1", input: "", expected: "" },
  { id: "2", name: "Case 2", input: "", expected: "" },
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

// ============================================================
// SAVED PROBLEMS / CODES MANAGER
// ============================================================

export const getSavedProblems = () => {
  try {
    const raw = localStorage.getItem(SAVED_PROBLEMS_KEY);
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
    const isSeeded = localStorage.getItem(TEMPLATES_SEEDED_KEY);
    let list = [];
    if (!isSeeded) {
      list = [...INITIAL_SEEDED_TEMPLATES];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
      localStorage.setItem(TEMPLATES_SEEDED_KEY, "true");
    } else {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      list = raw ? JSON.parse(raw) : [];
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
};

export default storageService;
