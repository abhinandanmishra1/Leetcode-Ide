import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { getStatusById } from '../languages/index.js';
import ResultParser from './ResultParser.js';

const execAsync = promisify(exec);

export class ProcessSandbox {
  constructor() {
    this.parser = new ResultParser();
  }

  async execute(submission) {
    const { token, source_code, language, stdin, cpu_time_limit } = submission;
    const timeoutSeconds = cpu_time_limit || language.default_cpu_limit || 3.0;
    const timeoutMs = Math.round(timeoutSeconds * 1000);

    // Ephemeral isolated working directory
    const scratchDir = path.join(os.tmpdir(), 'codebox', token);
    await fs.mkdir(scratchDir, { recursive: true });

    const sourcePath = path.join(scratchDir, language.source_file);
    await fs.writeFile(sourcePath, source_code || '', 'utf-8');

    try {
      // 1. Compilation phase if required
      if (language.compile_cmd) {
        logger.info({ token, compile_cmd: language.compile_cmd }, `🔨 Compiling [${language.name}]...`);
        try {
          await execAsync(language.compile_cmd, {
            cwd: scratchDir,
            timeout: timeoutMs + 2000,
            maxBuffer: 10 * 1024 * 1024,
          });
        } catch (compileErr) {
          const compileOutput = compileErr.stderr || compileErr.stdout || compileErr.message;
          logger.warn({ token, error: compileOutput.slice(0, 200) }, `❌ Compilation failed for [${language.name}]`);
          return {
            status: getStatusById(6), // Compilation Error
            stdout: null,
            stderr: null,
            compile_output: compileOutput,
            time: 0,
            memory: 0,
            exit_code: compileErr.code || 1,
          };
        }
      }

      // 2. Execution phase with resource limits and stdin
      logger.info({ token, run_cmd: language.run_cmd, timeout: `${timeoutSeconds}s` }, `🚀 Executing [${language.name}]...`);
      const startTime = process.hrtime.bigint();
      const runResult = await this.runProcess(language.run_cmd, scratchDir, stdin || '', timeoutMs);
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1e9; // in seconds

      const parsed = this.parser.parseExecutionResult(runResult);

      return {
        ...parsed,
        compile_output: null,
        time: parseFloat(executionTime.toFixed(3)),
        memory: Math.round(process.memoryUsage().heapUsed / 1024), // Memory KB
      };
    } finally {
      // Immediate scratchpad cleanup
      try {
        await fs.rm(scratchDir, { recursive: true, force: true });
      } catch (err) {
        logger.warn({ token, err: err.message }, 'Failed to clean scratchpad directory');
      }
    }
  }

  runProcess(command, cwd, stdin, timeoutMs) {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const child = spawn(cmd, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();

      child.stdout.on('data', (data) => {
        if (stdout.length < 10 * 1024 * 1024) stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        if (stderr.length < 10 * 1024 * 1024) stderr += data.toString();
      });

      child.on('close', (code, signal) => {
        clearTimeout(timer);
        resolve({
          exitCode: code,
          signal,
          timedOut,
          stdout,
          stderr,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          signal: null,
          timedOut: false,
          stdout,
          stderr: stderr || err.message,
        });
      });
    });
  }
}

export default ProcessSandbox;
