export default {
  id: 63,
  name: 'JavaScript (Node.js 20)',
  label: 'JavaScript',
  value: 'javascript',
  source_file: 'Solution.js',
  compile_cmd: null,
  run_cmd: 'node Solution.js',
  default_cpu_limit: 2.0,
  default_memory_limit: 262144,
  resolve(sourceCode) {
    const code = sourceCode || '';
    let prefix = '';
    if (!/\b(const|let|var)\s+fs\b/.test(code) && !/import\s+.*from\s+['"]fs['"]/.test(code)) {
      prefix += 'const fs = require("fs");\n';
    }
    return {
      source_code: prefix + code,
    };
  },
};
