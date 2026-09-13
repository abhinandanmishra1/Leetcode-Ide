import cpp from './cpp.js';
import c from './c.js';
import java from './java.js';
import python from './python.js';
import javascript from './javascript.js';
import typescript from './typescript.js';

const languagesList = [cpp, java, python, javascript, typescript, c];
const languagesById = new Map(languagesList.map((lang) => [lang.id, lang]));

// RapidAPI ID aliases for compatibility
const ALIASES = {
  93: javascript,
  102: javascript,
  94: typescript,
  92: python,
};
Object.entries(ALIASES).forEach(([aliasId, lang]) => {
  languagesById.set(Number(aliasId), lang);
});

export const STATUSES = {
  1: { id: 1, description: 'In Queue' },
  2: { id: 2, description: 'Processing' },
  3: { id: 3, description: 'Accepted' },
  4: { id: 4, description: 'Wrong Answer' },
  5: { id: 5, description: 'Time Limit Exceeded' },
  6: { id: 6, description: 'Compilation Error' },
  7: { id: 7, description: 'Runtime Error (SIGSEGV)' },
  11: { id: 11, description: 'Runtime Error (NZEC)' },
  13: { id: 13, description: 'Internal Error' },
};

export function getLanguageById(id) {
  return languagesById.get(Number(id)) || null;
}

export function getAllLanguages() {
  return languagesList;
}

export function getStatusById(id) {
  return STATUSES[id] || { id, description: 'Unknown Status' };
}

export default {
  getLanguageById,
  getAllLanguages,
  getStatusById,
  STATUSES,
};
