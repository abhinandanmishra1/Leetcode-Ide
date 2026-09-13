export default {
  id: 74,
  name: 'TypeScript (Node.js 20)',
  label: 'TypeScript',
  value: 'typescript',
  source_file: 'Solution.ts',
  compile_cmd: 'tsc --target es2022 Solution.ts',
  run_cmd: 'node Solution.js',
  default_cpu_limit: 3.0,
  default_memory_limit: 262144,
  resolve(sourceCode) {
    const code = sourceCode || '';
    let prefix = '';
    if (!/\b(const|let|var)\s+fs\b/.test(code) && !/import\s+.*from\s+['"]fs['"]/.test(code)) {
      prefix += 'import * as fs from "fs";\n';
    }
    return {
      source_code: prefix + code,
    };
  },
};
