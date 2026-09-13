import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const includeDir = path.resolve(__dirname, '../../include');

export default {
  id: 54,
  name: 'C++ (GCC 11+)',
  label: 'C++',
  value: 'cpp',
  source_file: 'Solution.cpp',
  compile_cmd: `g++ -O2 -std=c++17 -I "${includeDir}" Solution.cpp -o Solution`,
  run_cmd: './Solution',
  default_cpu_limit: 2.0,
  default_memory_limit: 262144, // 256MB in KB
};
