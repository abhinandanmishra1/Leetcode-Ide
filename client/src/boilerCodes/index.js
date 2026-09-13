export const cppBoiler = `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello LeetCode C++!" << endl;
    return 0;
}
`;

export const javaBoiler = `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello LeetCode Java!");
    }
}
`;

export const pyBoiler = `print("Hello LeetCode Python!")
`;

export const jsBoiler = `console.log("Hello LeetCode JavaScript!");
`;

export const tsBoiler = `const greeting: string = "Hello LeetCode TypeScript!";
console.log(greeting);
`;

export const cBoiler = `#include <stdio.h>

int main() {
    printf("Hello LeetCode C!\\n");
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
      return jsBoiler;
  }
};

export default boilerCodes;
