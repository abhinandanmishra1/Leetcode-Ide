export default {
  id: 50,
  name: 'C (GCC 11+)',
  label: 'C',
  value: 'c',
  source_file: 'Solution.c',
  compile_cmd: 'gcc -O2 Solution.c -o Solution',
  run_cmd: './Solution',
  default_cpu_limit: 2.0,
  default_memory_limit: 262144,
  resolve(sourceCode) {
    let code = sourceCode || '';
    let prefix = '';
    if (!/#include\s*<stdio\.h>/.test(code)) prefix += '#include <stdio.h>\n';
    if (!/#include\s*<stdlib\.h>/.test(code)) prefix += '#include <stdlib.h>\n';
    if (!/#include\s*<string\.h>/.test(code)) prefix += '#include <string.h>\n';
    if (!/#include\s*<stdbool\.h>/.test(code)) prefix += '#include <stdbool.h>\n';
    if (!/#include\s*<math\.h>/.test(code)) prefix += '#include <math.h>\n';
    return {
      source_code: prefix + code,
    };
  },
};
