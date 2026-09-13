import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate tsc from local node_modules or system PATH
const localTsc = path.resolve(__dirname, '../../node_modules/.bin/tsc');
const tscCmd = fs.existsSync(localTsc) ? `"${localTsc}"` : 'tsc';

// Locate node_modules/@types for Node type declarations (fs, process, etc.)
const typesDir = path.resolve(__dirname, '../../node_modules/@types');
const typeRootsFlag = fs.existsSync(typesDir) ? `--typeRoots "${typesDir}" --types node` : '';

export default {
  id: 74,
  name: 'TypeScript (Node.js 20)',
  label: 'TypeScript',
  value: 'typescript',
  source_file: 'Solution.ts',
  compile_cmd: `${tscCmd} --target es2022 --module commonjs --skipLibCheck ${typeRootsFlag} Solution.ts`,
  run_cmd: 'node Solution.js',
  default_cpu_limit: 3.0,
  default_memory_limit: 262144,
  resolve(sourceCode) {
    const code = sourceCode || '';
    let prefix = '';

    if (!/\b(const|let|var)\s+fs\b/.test(code) && !/import\s+.*from\s+['"]fs['"]/.test(code)) {
      prefix += 'import * as fs from "fs";\n';
    }

    // Provide standard CP input parsing utilities if not declared
    if (!code.includes('class Scanner')) {
      prefix += `
class Scanner {
    private input: string;
    private index: number;
    private length: number;
    constructor(input?: string) {
        try {
            this.input = input !== undefined ? input : fs.readFileSync(0, 'utf8');
        } catch (e) {
            this.input = '';
        }
        this.index = 0;
        this.length = this.input.length;
    }
    hasNext(): boolean {
        this.skipWhitespace();
        return this.index < this.length;
    }
    skipWhitespace(): void {
        while (this.index < this.length && this.input.charCodeAt(this.index) <= 32) {
            this.index++;
        }
    }
    next(): string {
        this.skipWhitespace();
        if (this.index >= this.length) {
            throw new Error("Runtime Error: Unexpected end of stdin (code expected input but testcase did not provide it)");
        }
        const start = this.index;
        while (this.index < this.length && this.input.charCodeAt(this.index) > 32) {
            this.index++;
        }
        return this.input.slice(start, this.index);
    }
    nextInt(): number {
        this.skipWhitespace();
        if (this.index >= this.length) {
            throw new Error("Runtime Error: Unexpected end of stdin (code expected integer but testcase did not provide it)");
        }
        const start = this.index;
        let sign = 1;
        if (this.input.charCodeAt(this.index) === 45) {
            sign = -1;
            this.index++;
        } else if (this.input.charCodeAt(this.index) === 43) {
            this.index++;
        }
        const digitStart = this.index;
        let num = 0;
        while (this.index < this.length) {
            const code = this.input.charCodeAt(this.index);
            if (code < 48 || code > 57) break;
            num = num * 10 + (code - 48);
            this.index++;
        }
        if (this.index === digitStart) {
            const invalidToken = this.next();
            throw new Error(\`Runtime Error: Expected integer input on stdin, received "\${invalidToken}"\`);
        }
        if (this.index < this.length && this.input.charCodeAt(this.index) > 32) {
            const fullToken = this.input.slice(start, this.index) + this.next();
            throw new Error(\`Runtime Error: Expected integer input on stdin, received "\${fullToken}"\`);
        }
        return num * sign;
    }
    nextFloat(): number {
        const token = this.next();
        const num = Number(token);
        if (isNaN(num)) {
            throw new Error(\`Runtime Error: Expected numeric input on stdin, received "\${token}"\`);
        }
        return num;
    }
    nextBigInt(): bigint {
        const token = this.next();
        try {
            return BigInt(token);
        } catch {
            throw new Error(\`Runtime Error: Expected BigInt input on stdin, received "\${token}"\`);
        }
    }
    nextArray(n: number): number[] {
        if (typeof n !== 'number' || isNaN(n) || n < 0) {
            throw new Error(\`Runtime Error: Expected non-negative integer for array size, received "\${n}"\`);
        }
        const arr = new Array<number>(n);
        for (let i = 0; i < n; i++) {
            if (!this.hasNext()) {
                throw new Error(\`Runtime Error: Unexpected end of stdin (expected \${n} array elements, but testcase only provided \${i})\`);
            }
            arr[i] = this.nextInt();
        }
        return arr;
    }
}
let _defaultScannerInstance: Scanner;
function _getDefaultScanner(): Scanner {
    if (!_defaultScannerInstance) _defaultScannerInstance = new Scanner();
    return _defaultScannerInstance;
}
function getStringInput(): string { return _getDefaultScanner().next(); }
function getIntInput(): number { return _getDefaultScanner().nextInt(); }
function getNumInput(): number { return _getDefaultScanner().nextFloat(); }
function getArrayInput(n: number): number[] { return _getDefaultScanner().nextArray(n); }
`;
    }

    return {
      source_code: prefix + code,
    };
  },
};
