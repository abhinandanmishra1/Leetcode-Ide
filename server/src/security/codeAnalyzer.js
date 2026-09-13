const SENSITIVE_PATHS = [
  /\/etc\/passwd/,
  /\/etc\/shadow/,
  /\/etc\/group/,
  /\/proc\/self\//,
  /\/proc\/1\//,
  /\/var\/run\/docker\.sock/,
  /\/dev\/sd[a-z]/,
  /\/dev\/nvme/,
];

const C_CPP_PATTERNS = [
  { pattern: /\bptrace\s*\(/, reason: 'ptrace syscall prohibited' },
  { pattern: /sys\/ptrace\.h/, reason: 'ptrace header prohibited' },
  { pattern: /\bsocket\s*\(/, reason: 'socket syscall prohibited' },
  { pattern: /\bconnect\s*\(\s*\w+\s*,/, reason: 'network connect prohibited' },
  { pattern: /\bbind\s*\(\s*\w+\s*,/, reason: 'network bind prohibited' },
  { pattern: /while\s*\(\s*1\s*\)\s*\{?\s*fork\s*\(/, reason: 'fork bomb detected' },
  { pattern: /while\s*\(fork\s*\(\)/, reason: 'fork bomb detected' },
  { pattern: /:\s*fork\s*\(\)\s*\|/, reason: 'fork bomb detected' },
];

const JAVA_PATTERNS = [
  { pattern: /Runtime\s*\.\s*getRuntime\s*\(\s*\)\s*\.\s*exec/, reason: 'Runtime.exec() prohibited' },
  { pattern: /ProcessBuilder/, reason: 'ProcessBuilder prohibited' },
  { pattern: /java\.net\.Socket/, reason: 'network socket prohibited' },
  { pattern: /java\.net\.ServerSocket/, reason: 'network server socket prohibited' },
];

const PYTHON_PATTERNS = [
  { pattern: /os\.fork\s*\(/, reason: 'os.fork() prohibited' },
  { pattern: /socket\s*\.\s*socket/, reason: 'network socket prohibited' },
  { pattern: /subprocess\s*\.\s*Popen/, reason: 'subprocess.Popen prohibited' },
];

export function analyzeCode(sourceCode, languageId) {
  if (!sourceCode) return { rejected: false, reason: null };

  for (const pathPattern of SENSITIVE_PATHS) {
    if (pathPattern.test(sourceCode)) {
      return { rejected: true, reason: 'Access to sensitive path prohibited' };
    }
  }

  // Language specific checks
  if (languageId === 50 || languageId === 54) {
    for (const { pattern, reason } of C_CPP_PATTERNS) {
      if (pattern.test(sourceCode)) return { rejected: true, reason };
    }
  } else if (languageId === 62) {
    for (const { pattern, reason } of JAVA_PATTERNS) {
      if (pattern.test(sourceCode)) return { rejected: true, reason };
    }
  } else if (languageId === 71) {
    for (const { pattern, reason } of PYTHON_PATTERNS) {
      if (pattern.test(sourceCode)) return { rejected: true, reason };
    }
  }

  return { rejected: false, reason: null };
}

export default {
  analyzeCode,
};
