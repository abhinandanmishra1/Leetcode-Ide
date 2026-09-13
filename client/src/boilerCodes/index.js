export const cppBoiler = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // 1. Read one number
    int n;
    cin >> n;

    // 2. Read one string
    string s;
    cin >> s;

    // 3. Read array of n numbers
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    // Output values
    cout << "Number: " << n << "\\n";
    cout << "String: " << s << "\\n";
    cout << "Array: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i + 1 < n ? " " : "\\n");
    }

    return 0;
}
`;

export const javaBoiler = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // 1. Read one number
        int n = sc.nextInt();

        // 2. Read one string
        String s = sc.next();

        // 3. Read array of n numbers
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // Output values
        System.out.println("Number: " + n);
        System.out.println("String: " + s);
        System.out.print("Array: ");
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i + 1 < n ? " " : "\\n"));
        }
    }
}
`;

export const pyBoiler = `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return

    # 1. Read one number
    n = int(input_data[0])

    # 2. Read one string
    s = input_data[1]

    # 3. Read array of n numbers
    arr = [int(x) for x in input_data[2:2 + n]]

    # Output values
    print(f"Number: {n}")
    print(f"String: {s}")
    print("Array:", " ".join(map(str, arr)))

if __name__ == "__main__":
    main()
`;

export const jsBoiler = `const fs = require('fs');

class Scanner {
    constructor() {
        try {
            this.input = fs.readFileSync(0, 'utf8');
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
        while (
            this.index < this.length &&
            this.input.charCodeAt(this.index) <= 32
        ) {
            this.index++;
        }
    }

    next() {
        this.skipWhitespace();
        if (this.index >= this.length) {
            throw new Error("Runtime Error: Unexpected end of stdin (code expected input but testcase did not provide it)");
        }

        const start = this.index;

        while (
            this.index < this.length &&
            this.input.charCodeAt(this.index) > 32
        ) {
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

        if (this.input.charCodeAt(this.index) === 45) { // '-'
            sign = -1;
            this.index++;
        } else if (this.input.charCodeAt(this.index) === 43) { // '+'
            this.index++;
        }

        const digitStart = this.index;
        let num = 0;

        while (this.index < this.length) {
            const code = this.input.charCodeAt(this.index);

            if (code < 48 || code > 57) {
                break;
            }

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

const sc = new Scanner();

// 1. Read one number
const n = sc.nextInt();

// 2. Read one string
const s = sc.next();

// 3. Read array of n numbers
const arr = sc.nextArray(n);

// Output values
console.log(\`Number: \${n}\`);
console.log(\`String: \${s}\`);
console.log(\`Array: \${arr.join(' ')}\`);
`;

export const tsBoiler = `import * as fs from 'fs';

class Scanner {
    private input: string;
    private index: number;
    private length: number;

    constructor() {
        try {
            this.input = fs.readFileSync(0, 'utf8');
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
        while (
            this.index < this.length &&
            this.input.charCodeAt(this.index) <= 32
        ) {
            this.index++;
        }
    }

    next(): string {
        this.skipWhitespace();
        if (this.index >= this.length) {
            throw new Error("Runtime Error: Unexpected end of stdin (code expected input but testcase did not provide it)");
        }

        const start = this.index;

        while (
            this.index < this.length &&
            this.input.charCodeAt(this.index) > 32
        ) {
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

        if (this.input.charCodeAt(this.index) === 45) { // '-'
            sign = -1;
            this.index++;
        } else if (this.input.charCodeAt(this.index) === 43) { // '+'
            this.index++;
        }

        const digitStart = this.index;
        let num = 0;

        while (this.index < this.length) {
            const code = this.input.charCodeAt(this.index);

            if (code < 48 || code > 57) {
                break;
            }

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

const sc = new Scanner();

// 1. Read one number
const n: number = sc.nextInt();

// 2. Read one string
const s: string = sc.next();

// 3. Read array of n numbers
const arr: number[] = sc.nextArray(n);

// Output values
console.log(\`Number: \${n}\`);
console.log(\`String: \${s}\`);
console.log(\`Array: \${arr.join(' ')}\`);
`;

export const cBoiler = `#include <stdio.h>
#include <stdlib.h>

int main() {
    // 1. Read one number
    int n;
    if (scanf("%d", &n) != 1) return 0;

    // 2. Read one string
    char s[256];
    scanf("%255s", s);

    // 3. Read array of n numbers
    int *arr = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

    // Output values
    printf("Number: %d\\n", n);
    printf("String: %s\\n", s);
    printf("Array: ");
    for (int i = 0; i < n; i++) {
        printf("%d%s", arr[i], (i + 1 < n) ? " " : "\\n");
    }

    free(arr);
    return 0;
}
`;

export const boilerCodes = (languageId) => {
  switch (Number(languageId)) {
    case 54:
      return cppBoiler;
    case 62:
      return javaBoiler;
    case 71:
      return pyBoiler;
    case 63:
      return jsBoiler;
    case 74:
      return tsBoiler;
    case 50:
      return cBoiler;
    default:
      return cppBoiler;
  }
};

export default boilerCodes;
