// CodePad standard I/O starter code templates
export const cppBoiler = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // 1. Read one number
    int n;
    if (!(cin >> n)) return 0;

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
        if (!sc.hasNextInt()) return;

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

// ==========================================
// Fast I/O Utilities for JavaScript
// ==========================================
let _inputTokens = [];
let _tokenIndex = 0;

function _loadInput() {
    if (_inputTokens.length === 0) {
        const raw = fs.readFileSync(0, 'utf-8');
        _inputTokens = raw.trim().split(/\\s+/).filter(Boolean);
    }
}

/**
 * Reads the next token as a string
 */
function getStringInput() {
    _loadInput();
    return _tokenIndex < _inputTokens.length ? _inputTokens[_tokenIndex++] : "";
}

/**
 * Reads the next token as a number
 */
function getNumInput() {
    return Number(getStringInput());
}

/**
 * Reads the next n tokens as an array of numbers
 */
function getArrayInput(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(getNumInput());
    }
    return arr;
}

function main() {
    // 1. Read one number
    const n = getNumInput();
    if (isNaN(n)) return;

    // 2. Read one string
    const s = getStringInput();

    // 3. Read array of n numbers
    const arr = getArrayInput(n);

    // Output values
    console.log(\`Number: \${n}\`);
    console.log(\`String: \${s}\`);
    console.log(\`Array: \${arr.join(' ')}\`);
}

main();
`;

export const tsBoiler = `import * as fs from 'fs';

// ==========================================
// Fast I/O Utilities for TypeScript
// ==========================================
let _inputTokens: string[] = [];
let _tokenIndex: number = 0;

function _loadInput(): void {
    if (_inputTokens.length === 0) {
        const raw = fs.readFileSync(0, 'utf-8');
        _inputTokens = raw.trim().split(/\\s+/).filter(Boolean);
    }
}

/**
 * Reads the next token as a string
 */
function getStringInput(): string {
    _loadInput();
    return _tokenIndex < _inputTokens.length ? _inputTokens[_tokenIndex++] : "";
}

/**
 * Reads the next token as a number
 */
function getNumInput(): number {
    return Number(getStringInput());
}

/**
 * Reads the next n tokens as an array of numbers
 */
function getArrayInput(n: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
        arr.push(getNumInput());
    }
    return arr;
}

function main(): void {
    // 1. Read one number
    const n: number = getNumInput();
    if (isNaN(n)) return;

    // 2. Read one string
    const s: string = getStringInput();

    // 3. Read array of n numbers
    const arr: number[] = getArrayInput(n);

    // Output values
    console.log(\`Number: \${n}\`);
    console.log(\`String: \${s}\`);
    console.log(\`Array: \${arr.join(' ')}\`);
}

main();
`;

export const cBoiler = `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    char s[256];
    scanf("%255s", s);

    int *arr = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

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
