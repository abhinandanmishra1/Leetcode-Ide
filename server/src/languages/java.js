export default {
  id: 62,
  name: 'Java (OpenJDK 17)',
  label: 'Java',
  value: 'java',
  source_file: 'Solution.java',
  compile_cmd: 'javac Solution.java',
  run_cmd: 'java -Xmx256m Solution',
  default_cpu_limit: 5.0,
  default_memory_limit: 262144,
  resolve(sourceCode) {
    let className = 'Solution';

    // 1. Look for public class <Name>
    const publicClassMatch = sourceCode.match(/public\s+(?:final\s+)?class\s+([A-Za-z0-9_$]+)/);
    if (publicClassMatch) {
      className = publicClassMatch[1];
    } else {
      // 2. Look for class containing public static void main
      const mainClassMatch = sourceCode.match(/class\s+([A-Za-z0-9_$]+)[^{]*\{[\s\S]*?public\s+static\s+void\s+main/);
      if (mainClassMatch) {
        className = mainClassMatch[1];
      } else {
        // 3. Fallback to any class definition
        const anyClassMatch = sourceCode.match(/class\s+([A-Za-z0-9_$]+)/);
        if (anyClassMatch) {
          className = anyClassMatch[1];
        }
      }
    }

    // Strip package statement to ensure class runs in default sandbox directory
    const sanitizedCode = (sourceCode || '').replace(
      /^\s*package\s+[^;]+;/m,
      '// package stripped for sandbox execution;'
    );

    return {
      source_file: `${className}.java`,
      compile_cmd: `javac ${className}.java`,
      run_cmd: `java -Xmx256m ${className}`,
      source_code: sanitizedCode,
    };
  },
};
