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

    let sourceFile = language.source_file;
    let compileCmd = language.compile_cmd;
    let runCmd = language.run_cmd;
    let codeToWrite = source_code || '';

    if (typeof language.resolve === 'function') {
      const resolved = language.resolve(codeToWrite);
      if (resolved.source_file) sourceFile = resolved.source_file;
      if (resolved.compile_cmd) compileCmd = resolved.compile_cmd;
      if (resolved.run_cmd) runCmd = resolved.run_cmd;
      if (resolved.source_code !== undefined) codeToWrite = resolved.source_code;
    }

    const sourcePath = path.join(scratchDir, sourceFile);
    await fs.writeFile(sourcePath, codeToWrite, 'utf-8');

    try {
      // 1. Compilation phase if required
      if (compileCmd) {
        logger.info({ token, compile_cmd: compileCmd }, `🔨 Compiling [${language.name}]...`);
        try {
          await execAsync(compileCmd, {
            cwd: scratchDir,
            timeout: Math.max(15000, timeoutMs + 5000),
            maxBuffer: 10 * 1024 * 1024,
          });
        } catch (compileErr) {
          let compileOutput = compileErr.stderr || compileErr.stdout || compileErr.message;
          if (compileOutput && typeof compileOutput === 'string') {
            const privScratch = scratchDir.startsWith('/var/') ? '/private' + scratchDir : scratchDir;
            compileOutput = compileOutput
              .replaceAll(privScratch + path.sep, '')
              .replaceAll(privScratch, '')
              .replaceAll(scratchDir + path.sep, '')
              .replaceAll(scratchDir, '');
          }
          logger.warn({ token, error: (compileOutput || '').slice(0, 200) }, `❌ Compilation failed for [${language.name}]`);
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
      logger.info({ token, run_cmd: runCmd, timeout: `${timeoutSeconds}s` }, `🚀 Executing [${language.name}]...`);
      const startTime = process.hrtime.bigint();
      const runResult = await this.runProcess(runCmd, scratchDir, stdin || '', timeoutMs);
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1e9; // in seconds

      const parsed = this.parser.parseExecutionResult(runResult);

      const sanitizePaths = (text) => {
        if (!text || typeof text !== 'string') return text;
        const privScratch = scratchDir.startsWith('/var/') ? '/private' + scratchDir : scratchDir;
        return text
          .replaceAll(privScratch + path.sep, '')
          .replaceAll(privScratch, '')
          .replaceAll(scratchDir + path.sep, '')
          .replaceAll(scratchDir, '');
      };

      if (parsed.stderr) parsed.stderr = sanitizePaths(parsed.stderr);
      if (parsed.stdout) parsed.stdout = sanitizePaths(parsed.stdout);

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
