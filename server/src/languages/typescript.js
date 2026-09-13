import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate tsc from local node_modules or system PATH
const localTsc = path.resolve(__dirname, '../../node_modules/.bin/tsc');
const tscCmd = fs.existsSync(localTsc) ? `"${localTsc}"` : 'tsc';

export default {
  id: 74,
  name: 'TypeScript (Node.js 20)',
  label: 'TypeScript',
  value: 'typescript',
  source_file: 'Solution.ts',
  compile_cmd: `${tscCmd} --target es2022 --module commonjs --skipLibCheck Solution.ts`,
  run_cmd: 'node Solution.js',
  default_cpu_limit: 3.0,
  default_memory_limit: 262144,
  resolve(sourceCode) {
    const code = sourceCode || '';
    let prefix = '';

    if (!/\b(const|let|var)\s+fs\b/.test(code) && !/import\s+.*from\s+['"]fs['"]/.test(code)) {
      if (!/declare\s+const\s+require/.test(code)) {
        prefix += 'declare const require: any;\n';
      }
      prefix += 'const fs: any = require("fs");\n';
    }

    // Provide standard CP input parsing utilities if not declared
    if (!code.includes('function getNumInput') && !code.includes('const getNumInput')) {
      prefix += `
let _inputTokens: string[] = [];
let _tokenIndex: number = 0;
function _loadInput(): void {
    if (_inputTokens.length === 0) {
        try {
            const raw = fs.readFileSync(0, 'utf-8');
            _inputTokens = raw.trim().split(/\\s+/).filter(Boolean);
        } catch (e) {
            _inputTokens = [];
        }
    }
}
function getStringInput(): string {
    _loadInput();
    return _tokenIndex < _inputTokens.length ? _inputTokens[_tokenIndex++] : "";
}
function getNumInput(): number {
    return Number(getStringInput());
}
function getArrayInput(n: number): number[] {
    const arr: number[] = [];
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
