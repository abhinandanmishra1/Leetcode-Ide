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

    // Provide standard CP input parsing utilities if not declared
    if (!code.includes('function getNumInput') && !code.includes('const getNumInput')) {
      prefix += `
let _inputTokens = [];
let _tokenIndex = 0;
function _loadInput() {
    if (_inputTokens.length === 0) {
        try {
            const raw = fs.readFileSync(0, 'utf-8');
            _inputTokens = raw.trim().split(/\\s+/).filter(Boolean);
        } catch (e) {
            _inputTokens = [];
        }
    }
}
function getStringInput() {
    _loadInput();
    return _tokenIndex < _inputTokens.length ? _inputTokens[_tokenIndex++] : "";
}
function getNumInput() {
    return Number(getStringInput());
}
function getArrayInput(n) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(getNumInput());
    return arr;
}
`;
    }

    return {
      source_code: prefix + code,
    };
  },
};
