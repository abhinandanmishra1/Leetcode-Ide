import { getStatusById } from '../languages/index.js';

export class ResultParser {
  parseExecutionResult({ exitCode, signal, timedOut, stdout, stderr }) {
    if (timedOut) {
      return {
        status: getStatusById(5), // Time Limit Exceeded
        stdout: stdout || null,
        stderr: 'Time Limit Exceeded\n',
        exit_code: null,
      };
    }

    if (signal === 'SIGSEGV') {
      return {
        status: getStatusById(7),
        stdout: stdout || null,
        stderr: stderr || 'Segmentation fault (core dumped)\n',
        exit_code: null,
      };
    }

    if (exitCode !== 0) {
      return {
        status: getStatusById(11), // Runtime Error
        stdout: stdout || null,
        stderr: stderr || `Process exited with code ${exitCode}`,
        exit_code: exitCode,
      };
    }

    return {
      status: getStatusById(3), // Accepted
      stdout: stdout || '',
      stderr: stderr || null,
      exit_code: 0,
    };
  }
}

export default ResultParser;
