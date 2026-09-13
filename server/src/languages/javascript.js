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
    if (!code.includes('class Scanner')) {
      prefix += `
class Scanner {
    constructor(input) {
        try {
            this.input = input !== undefined ? input : fs.readFileSync(0, 'utf8');
        } catch (e) {
            this.input = '';
        }
        this.index = 0;
        this.length = this.input.length;
    }
    hasNext() {
        this.skipWhitespace();
        return this.index < this.length;
    }
    skipWhitespace() {
        while (this.index < this.length && this.input.charCodeAt(this.index) <= 32) {
            this.index++;
        }
    }
    next() {
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
    nextInt() {
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
    nextFloat() {
        const token = this.next();
        const num = Number(token);
        if (isNaN(num)) {
            throw new Error(\`Runtime Error: Expected numeric input on stdin, received "\${token}"\`);
        }
        return num;
    }
    nextBigInt() {
        const token = this.next();
        try {
            return BigInt(token);
        } catch {
            throw new Error(\`Runtime Error: Expected BigInt input on stdin, received "\${token}"\`);
        }
    }
    nextArray(n) {
        if (typeof n !== 'number' || isNaN(n) || n < 0) {
            throw new Error(\`Runtime Error: Expected non-negative integer for array size, received "\${n}"\`);
        }
        const arr = new Array(n);
        for (let i = 0; i < n; i++) {
            if (!this.hasNext()) {
                throw new Error(\`Runtime Error: Unexpected end of stdin (expected \${n} array elements, but testcase only provided \${i})\`);
            }
            arr[i] = this.nextInt();
        }
        return arr;
    }
}
let _defaultScannerInstance;
function _getDefaultScanner() {
    if (!_defaultScannerInstance) _defaultScannerInstance = new Scanner();
    return _defaultScannerInstance;
}
function getStringInput() { return _getDefaultScanner().next(); }
function getIntInput() { return _getDefaultScanner().nextInt(); }
function getNumInput() { return _getDefaultScanner().nextFloat(); }
function getArrayInput(n) { return _getDefaultScanner().nextArray(n); }
`;
    }

    return {
      source_code: prefix + code,
    };
  },
};
