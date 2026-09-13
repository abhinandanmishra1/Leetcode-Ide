export default {
  id: 71,
  name: 'Python 3',
  label: 'Python 3',
  value: 'python',
  source_file: 'Solution.py',
  compile_cmd: null,
  run_cmd: 'python3 Solution.py',
  default_cpu_limit: 3.0,
  default_memory_limit: 262144,
  resolve(sourceCode) {
    const code = sourceCode || '';
    const prefix = [
      'import sys, math, collections, itertools, heapq, bisect',
      'from collections import defaultdict, Counter, deque',
      'from heapq import heappush, heappop, heapify',
      'from bisect import bisect_left, bisect_right',
      '',
    ].join('\n');
    return {
      source_code: prefix + code,
    };
  },
};
