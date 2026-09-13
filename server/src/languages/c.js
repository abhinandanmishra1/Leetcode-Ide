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
};
