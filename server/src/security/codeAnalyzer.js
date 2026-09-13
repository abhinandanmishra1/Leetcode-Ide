/**
 * Code Execution Sandbox Pre-Execution Security Auditor
 * 
 * Audits source code for sandbox-security risks across 20 threat categories:
 * 1. Filesystem destruction
 * 2. Arbitrary command execution
 * 3. Shell execution
 * 4. Command injection
 * 5. Filesystem escape
 * 6. Sensitive filesystem access
 * 7. Environment / secret access
 * 8. Network access
 * 9. Reverse-shell behavior
 * 10. Privilege escalation
 * 11. Container escape
 * 12. Process manipulation
 * 13. Resource exhaustion
 * 14. Dynamic code execution
 * 15. Obfuscation
 * 16. Native code loading
 * 17. Device access
 * 18. Kernel / system interfaces
 * 19. Output abuse
 * 20. Sandbox boundary violations
 */

// Universal sensitive paths
const SENSITIVE_PATHS = [
  { pattern: /\/etc\/(passwd|shadow|sudoers|group|gshadow|hosts|crontab|resolv\.conf)/i, name: 'system credentials or config' },
  { pattern: /\/proc\/(self|1|\d+)\/(cmdline|environ|mem|maps|status|mountinfo)/i, name: 'process introspection or memory' },
  { pattern: /\/proc\/kallsyms/i, name: 'kernel symbol table' },
  { pattern: /\/var\/run\/docker\.sock/i, name: 'Docker control socket' },
  { pattern: /\/var\/run\/secrets\/kubernetes\.io/i, name: 'Kubernetes service account credentials' },
  { pattern: /\/dev\/(sd[a-z]|nvme\d|mem|kmem|port|raw)/i, name: 'raw block or kernel memory device' },
  { pattern: /(\.ssh\/(id_rsa|id_ecdsa|id_ed25519|authorized_keys|known_hosts)|\.aws\/credentials|\.git\/config|\.env\b)/i, name: 'secrets or credentials file' },
  { pattern: /\/sys\/(fs\/cgroup|kernel|firmware)/i, name: 'kernel sysfs interface' },
];

/**
 * Normalizes source code by resolving string concatenations, hex/unicode escapes,
 * and base64 payloads to defeat static evasion techniques.
 */
function normalizeAndDeobfuscate(code) {
  let normalized = code;

  // 1. Resolve hex escape sequences: \x65\x74\x63 -> etc
  normalized = normalized.replace(/(\\x[0-9a-fA-F]{2})+/g, (match) => {
    try {
      const hexes = match.split('\\x').filter(Boolean);
      const chars = hexes.map((h) => String.fromCharCode(parseInt(h, 16))).join('');
      return chars;
    } catch {
      return match;
    }
  });

  // 2. Resolve unicode escape sequences: \u002f -> /
  normalized = normalized.replace(/(\\u[0-9a-fA-F]{4})+/g, (match) => {
    try {
      const unies = match.split('\\u').filter(Boolean);
      const chars = unies.map((u) => String.fromCharCode(parseInt(u, 16))).join('');
      return chars;
    } catch {
      return match;
    }
  });

  // 3. Resolve adjacent string concatenation: "sh" + "util" or 'child_' + 'process'
  normalized = normalized.replace(/['"]\s*\+\s*['"]/g, '');

  return normalized;
}

/**
 * Checks for base64 encoded strings that conceal dangerous commands or paths.
 */
function inspectBase64Payloads(code) {
  const base64Regex = /['"]([A-Za-z0-9+/]{8,}={0,2})['"]/g;
  const decodedSnippets = [];
  let match;
  while ((match = base64Regex.exec(code)) !== null) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      // If the decoded content contains recognizable shell commands or paths
      if (
        /\/bin\/(sh|bash|zsh)|\/etc\/passwd|rm\s+-rf|curl\s|wget\s|socket\(|os\.system/i.test(
          decoded
        )
      ) {
        decodedSnippets.push({
          raw: match[1],
          decoded,
          index: match.index,
        });
      }
    } catch {
      // Not valid base64 or utf8, ignore
    }
  }
  return decodedSnippets;
}

/**
 * Finds the 1-based line number for a character index in source code.
 */
function getLineNumber(code, index) {
  if (index == null || index < 0) return 1;
  return code.slice(0, index).split('\n').length;
}

/**
 * Core security rules table categorized into the 20 threat categories.
 */
const SECURITY_RULES = [
  // ============================================================
  // 1. Filesystem Destruction
  // ============================================================
  {
    category: 'Filesystem destruction',
    severity: 'CRITICAL',
    pattern: /\b(shutil\.rmtree|os\.unlink|os\.remove|os\.rmdir|os\.truncate)\b/,
    languages: ['python'],
    risk: 'Arbitrary recursive deletion or truncation of filesystem directories and files',
    recommendation: 'Mount sandbox filesystem as read-only and restrict destructive syscalls (unlink, rmdir)',
  },
  {
    category: 'Filesystem destruction',
    severity: 'CRITICAL',
    pattern: /\b(fs\.(rmSync|rmdirSync|unlinkSync|truncateSync|rm\b|rmdir\b|unlink\b))\b/,
    languages: ['javascript', 'typescript'],
    risk: 'Destruction or truncation of sandbox filesystem files and directories',
    recommendation: 'Use read-only container rootfs or overlayfs sandbox mount',
  },
  {
    category: 'Filesystem destruction',
    severity: 'CRITICAL',
    pattern: /\b(unlink|rmdir|remove|ftruncate|truncate)\s*\(/,
    languages: ['c', 'cpp'],
    risk: 'Unlinking host/sandbox files and destroying directories via C POSIX APIs',
    recommendation: 'Block unlink, unlinkat, rmdir via seccomp filter',
  },
  {
    category: 'Filesystem destruction',
    severity: 'CRITICAL',
    pattern: /\b(Files\.(delete|deleteIfExists)|File\b[^\n;]*\.delete\s*\()\b/,
    languages: ['java'],
    risk: 'Java file deletion calls attempting to erase sandbox contents',
    recommendation: 'Configure Java SecurityManager to deny file write/delete permissions',
  },
  {
    category: 'Filesystem destruction',
    severity: 'CRITICAL',
    pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f?|-[a-zA-Z]*f[a-zA-Z]*r?)\b/,
    languages: ['all'],
    risk: 'Shell recursive force deletion command detected',
    recommendation: 'Deny shell execution and mount filesystem read-only',
  },

  // ============================================================
  // 2. Arbitrary Command Execution
  // ============================================================
  {
    category: 'Arbitrary command execution',
    severity: 'CRITICAL',
    pattern: /\b(system|popen|execl|execlp|execle|execv|execvp|execvpe|posix_spawn)\s*\(/,
    languages: ['c', 'cpp'],
    risk: 'Spawning arbitrary host processes or executing arbitrary shell commands',
    recommendation: 'Block execve, execveat, and fork via seccomp filter',
  },
  {
    category: 'Arbitrary command execution',
    severity: 'CRITICAL',
    pattern: /\b(subprocess\.(Popen|run|call|check_output|check_call)|os\.(system|popen|spawn[a-z]*|exec[a-z]*))\b/,
    languages: ['python'],
    risk: 'Arbitrary subprocess spawning and command execution outside the runner',
    recommendation: 'Prohibit subprocess/os command spawning modules',
  },
  {
    category: 'Arbitrary command execution',
    severity: 'CRITICAL',
    pattern: /\b(Runtime\s*\.\s*getRuntime\s*\(\s*\)\s*\.\s*exec|ProcessBuilder)\b/,
    languages: ['java'],
    risk: 'Execution of host binaries via Java process creation APIs',
    recommendation: 'Apply Java SecurityManager checkExec restriction',
  },
  {
    category: 'Arbitrary command execution',
    severity: 'CRITICAL',
    pattern: /\b(child_process|require\s*\(\s*['"]child_process['"]\)|execSync|spawnSync|fork\s*\(|execFile)\b/,
    languages: ['javascript', 'typescript'],
    risk: 'Spawning child processes and shell commands via Node.js child_process module',
    recommendation: 'Run Node with --disallow-code-generation-from-strings and block child_process',
  },

  // ============================================================
  // 3. Shell Execution
  // ============================================================
  {
    category: 'Shell execution',
    severity: 'CRITICAL',
    pattern: /(\/bin\/(ba)?sh|\/bin\/zsh|\bcmd\.exe\b|\bpowershell(\.exe)?\b|['"]sh['"]\s*,\s*['"]-c['"]|['"]bash['"]\s*,\s*['"]-c['"])/i,
    languages: ['all'],
    risk: 'Interactive or non-interactive shell interpreter invocation',
    recommendation: 'Isolate user execution in an unprivileged container with no shell binary access',
  },

  // ============================================================
  // 4. Command Injection
  // ============================================================
  {
    category: 'Command injection',
    severity: 'CRITICAL',
    pattern: /(\b(system|popen|exec|execSync|spawnSync|Popen)\s*\([^)]*(\$\{|\+|%|\.format|\bconcat\b)[^)]*\b(&&|\|\||;|`|\$\()|\b(&&|\|\|)\s*\/bin\/(ba)?sh)/,
    languages: ['all'],
    risk: 'Constructing dynamic command strings with command chaining operators (&&, ||, ;, backticks)',
    recommendation: 'Eliminate command execution capabilities entirely; do not execute commands via shell',
  },

  // ============================================================
  // 5. Filesystem Escape
  // ============================================================
  {
    category: 'Filesystem escape',
    severity: 'CRITICAL',
    pattern: /(\.\.\/|\.\.\\){2,}/,
    languages: ['all'],
    risk: 'Directory traversal escaping the dedicated sandbox directory into host files',
    recommendation: 'Enforce chroot or unshare mount namespaces jail for execution directory',
  },
  {
    category: 'Filesystem escape',
    severity: 'HIGH',
    pattern: /\b(symlink|readlink|link\s*\(|createSymbolicLink|createLink|fs\.symlinkSync|os\.symlink)/,
    languages: ['all'],
    risk: 'Creating symbolic or hard links to access files outside the sandbox boundary',
    recommendation: 'Disable symlink following and block symlink/link syscalls',
  },

  // ============================================================
  // 6. Sensitive Filesystem Access
  // ============================================================
  // Checked dynamically via SENSITIVE_PATHS with CRITICAL severity

  // ============================================================
  // 7. Environment / Secret Access
  // ============================================================
  {
    category: 'Environment / secret access',
    severity: 'HIGH',
    pattern: /\b(process\.env|process\.binding)\b/,
    languages: ['javascript', 'typescript'],
    risk: 'Accessing environment variables, host secrets, or Node internal bindings',
    recommendation: 'Sanitize process.env before executing user scripts',
  },
  {
    category: 'Environment / secret access',
    severity: 'HIGH',
    pattern: /\b(os\.environ|os\.getenv)\b/,
    languages: ['python'],
    risk: 'Reading environment variables or secrets injected into host environment',
    recommendation: 'Clear os.environ in sandbox runner before executing code',
  },
  {
    category: 'Environment / secret access',
    severity: 'HIGH',
    pattern: /\bSystem\.(getenv|getProperty)\s*\(\s*["'](user\.home|os\.name|PATH|AWS|SECRET)/i,
    languages: ['java'],
    risk: 'Reading sensitive system properties or environment secrets via Java APIs',
    recommendation: 'Deny read access to environment variables in SecurityManager',
  },
  {
    category: 'Environment / secret access',
    severity: 'HIGH',
    pattern: /\b(getenv|secure_getenv)\s*\(/,
    languages: ['c', 'cpp'],
    risk: 'Reading host process environment variables that may contain tokens or keys',
    recommendation: 'Execute binary with clean, empty environment (env -i)',
  },

  // ============================================================
  // 8. Network Access
  // ============================================================
  {
    category: 'Network access',
    severity: 'HIGH',
    pattern: /\b(sys\/socket\.h|netinet\/in\.h|arpa\/inet\.h|\bsocket\s*\(|\bconnect\s*\(|\bbind\s*\(|\bgetaddrinfo\s*\()/,
    languages: ['c', 'cpp'],
    risk: 'Outbound network connections, data exfiltration, or LAN scanning via raw sockets',
    recommendation: 'Block socket, connect, and bind via seccomp and disable network namespaces',
  },
  {
    category: 'Network access',
    severity: 'HIGH',
    pattern: /\b(import\s+(socket|urllib|requests|http\.client|aiohttp|httpx)|from\s+(socket|urllib|requests|http)\b)/,
    languages: ['python'],
    risk: 'Exfiltrating data or fetching external payloads over HTTP/TCP/UDP',
    recommendation: 'Disable network interfaces (--network none in Docker or unshare -n)',
  },
  {
    category: 'Network access',
    severity: 'HIGH',
    pattern: /\b(java\.net\.(Socket|ServerSocket|HttpURLConnection|URL\b)|java\.net\.http\.HttpClient)\b/,
    languages: ['java'],
    risk: 'Network socket creation and outbound HTTP traffic',
    recommendation: 'Enforce SecurityManager checkConnect restriction and container network isolation',
  },
  {
    category: 'Network access',
    severity: 'HIGH',
    pattern: /\b(require\s*\(\s*['"](net|http|https|dgram|tls|dns)['"]\)|from\s+['"](net|http|https)['"]|\bfetch\s*\(|\bWebSocket\b)/,
    languages: ['javascript', 'typescript'],
    risk: 'Establishing outbound TCP, UDP, or HTTP network connections',
    recommendation: 'Run container with --network none',
  },
  {
    category: 'Network access',
    severity: 'HIGH',
    pattern: /\b(curl|wget|netcat|nc\s|ncat|ssh\s|scp\s|ping\s)\b/,
    languages: ['all'],
    risk: 'Invoking network utilities to exfiltrate data or reach external command & control',
    recommendation: 'Remove network client binaries from sandbox rootfs',
  },

  // ============================================================
  // 9. Reverse-Shell Behavior
  // ============================================================
  {
    category: 'Reverse-shell behavior',
    severity: 'CRITICAL',
    pattern: /(\/dev\/tcp\/\d|\bdup2\s*\([^)]*socket|pty\.spawn|\b(subprocess|Popen)\s*\([^)]*stdin\s*=\s*(s|sock|socket)\.fileno|\b(bash|sh)\s+-i\b)/,
    languages: ['all'],
    risk: 'Establishing an interactive reverse shell session to an external attacker',
    recommendation: 'Deny network access, disable pseudo-terminals, and block socket syscalls',
  },

  // ============================================================
  // 10. Privilege Escalation
  // ============================================================
  {
    category: 'Privilege escalation',
    severity: 'CRITICAL',
    pattern: /\b(sudo\s+|su\s+-[a-zA-Z]*|\bsetuid\s*\(|\bsetgid\s*\(|\bseteuid\s*\(|\bsetegid\s*\(|\bchmod\s+[0-7]*4[0-7]{3})\b/,
    languages: ['all'],
    risk: 'Attempting to change UID/GID, abuse sudo, or set SUID bit to gain root access',
    recommendation: 'Drop all Linux capabilities (cap_drop=ALL) and set no-new-privileges',
  },

  // ============================================================
  // 11. Container Escape
  // ============================================================
  {
    category: 'Container escape',
    severity: 'CRITICAL',
    pattern: /\b(unshare|setns|pivot_root|chroot|mount\s*\(|umount\s*\(|umount2)\s*\(/,
    languages: ['c', 'cpp', 'all'],
    risk: 'Manipulating Linux namespaces or mount points to escape container boundary',
    recommendation: 'Enforce user namespaces and block mount, unshare, setns syscalls in seccomp',
  },

  // ============================================================
  // 12. Process Manipulation
  // ============================================================
  {
    category: 'Process manipulation',
    severity: 'HIGH',
    pattern: /\b(ptrace\s*\(|sys\/ptrace\.h|\bkill\s*\(\s*-1\b|\bkillpg\s*\(|\bprocess\.kill\b|\bProcessHandle\.allProcesses\b)/,
    languages: ['all'],
    risk: 'Inspecting, tracing, or signaling neighboring processes on the host or sandbox',
    recommendation: 'Isolate PID namespaces (unshare -p) and block ptrace syscall',
  },

  // ============================================================
  // 13. Resource Exhaustion
  // ============================================================
  {
    category: 'Resource exhaustion',
    severity: 'CRITICAL',
    pattern: /(while\s*\(\s*(1|true)\s*\)\s*\{?\s*(fork|vfork|clone)\s*\(|while\s*\(fork\s*\(\)\)|:\s*fork\s*\(\)\s*\||:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:|while\s*True\s*:\s*os\.fork\(\))/,
    languages: ['all'],
    risk: 'Fork bomb exhausting system process table (PID starvation) and crashing host',
    recommendation: 'Enforce strict cgroup pids.max limit (e.g. max 16-32 pids) and RLIMIT_NPROC',
  },
  {
    category: 'Resource exhaustion',
    severity: 'MEDIUM',
    pattern: /(malloc\s*\(\s*(1024ULL\s*\*|1ULL\s*<<\s*4|0x[0-9a-fA-F]{9,})|new\s+byte\s*\[\s*Integer\.MAX_VALUE\s*\]|\[0\]\s*\*\s*\(10\s*\*\*\s*9\))/,
    languages: ['all'],
    risk: 'Unbounded memory allocation attempting to trigger host Out-Of-Memory (OOM) killer',
    recommendation: 'Enforce strict cgroup memory.max and RLIMIT_AS (e.g. 256MB - 512MB)',
  },

  // ============================================================
  // 14. Dynamic Code Execution
  // ============================================================
  {
    category: 'Dynamic code execution',
    severity: 'MEDIUM',
    pattern: /\b(eval\s*\(|Function\s*\(|vm\.runInContext|vm\.runInNewContext|new\s+Function)/,
    languages: ['javascript', 'typescript'],
    risk: 'Evaluating dynamically generated strings that may bypass static analysis',
    recommendation: 'Execute Node with --disallow-code-generation-from-strings',
  },
  {
    category: 'Dynamic code execution',
    severity: 'MEDIUM',
    pattern: /\b(eval\s*\(|exec\s*\(|__import__\s*\(|importlib\.import_module)/,
    languages: ['python'],
    risk: 'Dynamic evaluation of arbitrary Python expressions or dynamically imported modules',
    recommendation: 'Run Python in a sandboxed interpreter profile or restricted globals',
  },
  {
    category: 'Dynamic code execution',
    severity: 'HIGH',
    pattern: /\bClass\.forName\s*\(\s*["'](java\.lang\.Runtime|java\.lang\.ProcessBuilder)["']\)/,
    languages: ['java'],
    risk: 'Reflection used to invoke restricted execution APIs bypassing static compiler checks',
    recommendation: 'Configure Java security policy to forbid reflective access to system classes',
  },

  // ============================================================
  // 15. Obfuscation
  // ============================================================
  {
    category: 'Obfuscation',
    severity: 'HIGH',
    pattern: /(\\x[0-9a-fA-F]{2}){6,}|(\\u[0-9a-fA-F]{4}){6,}|String\.fromCharCode\s*\(\s*([0-9]+\s*,\s*){4,}/,
    languages: ['all'],
    risk: 'Obfuscated character sequences concealing dangerous strings or command payloads',
    recommendation: 'Reject heavily obfuscated source code prior to compilation',
  },
  {
    category: 'Obfuscation',
    severity: 'HIGH',
    pattern: /\b(__subclasses__|__builtins__|__globals__|getattr\s*\([^)]*['"]__[a-z]+__['"])\b/,
    languages: ['python'],
    risk: 'Python object model traversal to reach restricted builtins and OS modules',
    recommendation: 'Deny object traversal via Python audit hooks (sys.addaudithook)',
  },

  // ============================================================
  // 16. Native Code Loading
  // ============================================================
  {
    category: 'Native code loading',
    severity: 'HIGH',
    pattern: /\b(dlopen|dlsym|LoadLibrary|process\.dlopen)\b/,
    languages: ['c', 'cpp', 'javascript', 'typescript'],
    risk: 'Dynamically loading external shared objects (.so/.dll) outside sandbox control',
    recommendation: 'Block dlopen and dynamic link loading inside sandboxed process',
  },
  {
    category: 'Native code loading',
    severity: 'HIGH',
    pattern: /\b(import\s+ctypes|from\s+ctypes\b|import\s+cffi|from\s+cffi\b)/,
    languages: ['python'],
    risk: 'Using ctypes or FFI to call arbitrary C runtime functions and bypass Python sandbox',
    recommendation: 'Block ctypes and cffi modules from Python search path',
  },
  {
    category: 'Native code loading',
    severity: 'HIGH',
    pattern: /\bSystem\.(load|loadLibrary)\s*\(/,
    languages: ['java'],
    risk: 'Loading arbitrary native libraries via JNI into the Java Virtual Machine',
    recommendation: 'Deny loadLibrary in Java SecurityManager',
  },

  // ============================================================
  // 17. Device Access
  // ============================================================
  {
    category: 'Device access',
    severity: 'CRITICAL',
    pattern: /\/dev\/(sd[a-z]\d*|nvme\d+n\d+|mem|kmem|port|sda|sdb|hda)/,
    languages: ['all'],
    risk: 'Direct raw block device access or physical memory inspection',
    recommendation: 'Isolate container device tree (devices.deny=a, devices.allow=c 1:3 rwm for /dev/null, etc.)',
  },

  // ============================================================
  // 18. Kernel / System Interfaces
  // ============================================================
  {
    category: 'Kernel / system interfaces',
    severity: 'CRITICAL',
    pattern: /\b(syscall\s*\(|ioctl\s*\(|asm\s+volatile\s*\([^)]*syscall|asm\s*\([^)]*int\s+0x80)/,
    languages: ['c', 'cpp'],
    risk: 'Invoking arbitrary raw Linux kernel syscalls directly, bypassing library filters',
    recommendation: 'Deploy seccomp-bpf filter to restrict system calls to strict whitelist',
  },

  // ============================================================
  // 19. Output Abuse
  // ============================================================
  {
    category: 'Output abuse',
    severity: 'MEDIUM',
    pattern: /while\s*\(\s*(1|true)\s*\)\s*\{?\s*(printf\s*\(|cout\s*<<|System\.out\.print|console\.log\s*\()/,
    languages: ['all'],
    risk: 'Unbounded infinite output storm exhausting sandbox memory buffers and storage',
    recommendation: 'Enforce strict max_output_size buffer capping (e.g. 1MB - 5MB)',
  },

  // ============================================================
  // 20. Sandbox Boundary Violations
  // ============================================================
  {
    category: 'Sandbox boundary violations',
    severity: 'CRITICAL',
    pattern: /['"]\/(bin|usr\/bin|sbin|usr\/sbin|lib|usr\/lib|boot|opt)\/[^'"]*['"]/,
    languages: ['all'],
    risk: 'Directly referencing or inspecting host binary and library directories',
    recommendation: 'Ensure clean rootfs chroot without host path leaks',
  },
];

/**
 * Normalizes language ID or string representation to internal language tag.
 */
function normalizeLanguage(lang) {
  if (lang === 50 || lang === '50' || lang === 'c') return 'c';
  if (lang === 54 || lang === '54' || lang === 'cpp') return 'cpp';
  if (lang === 62 || lang === '62' || lang === 'java') return 'java';
  if (lang === 63 || lang === '63' || lang === 'javascript' || lang === 'js') return 'javascript';
  if (lang === 71 || lang === '71' || lang === 'python' || lang === 'py') return 'python';
  if (lang === 74 || lang === '74' || lang === 'typescript' || lang === 'ts') return 'typescript';
  return 'all';
}

/**
 * Performs a comprehensive security audit on submitted source code.
 *
 * @param {string} sourceCode - Raw user submitted source code.
 * @param {number|string} languageId - Judge0 language ID or language tag.
 * @returns {object} Security audit report with findings and verdict.
 */
export function auditCode(sourceCode, languageId) {
  if (!sourceCode || typeof sourceCode !== 'string' || !sourceCode.trim()) {
    return {
      safe_to_execute: true,
      confidence: 100,
      verdict: 'SAFE',
      findings: [],
    };
  }

  const langTag = normalizeLanguage(languageId);
  const normalizedCode = normalizeAndDeobfuscate(sourceCode);
  const findings = [];
  const seenKeys = new Set();

  function addFinding(finding) {
    const key = `${finding.category}-${finding.line}-${finding.evidence}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      findings.push(finding);
    }
  }

  // Check 1: Check sensitive path accesses across both raw and normalized code
  for (const { pattern, name } of SENSITIVE_PATHS) {
    const match = pattern.exec(sourceCode) || pattern.exec(normalizedCode);
    if (match) {
      const line = getLineNumber(sourceCode, match.index);
      addFinding({
        severity: 'CRITICAL',
        category: 'Sensitive filesystem access',
        line,
        evidence: `Attempt to access sensitive path: "${match[0]}" (${name})`,
        risk: `Unauthorized exposure or modification of host ${name}`,
        recommendation: 'Mount filesystem with read-only sandbox jail and block sensitive paths',
      });
    }
  }

  // Check 2: Check for base64 obfuscated payloads concealing dangerous commands
  const b64Payloads = inspectBase64Payloads(sourceCode);
  for (const payload of b64Payloads) {
    const line = getLineNumber(sourceCode, payload.index);
    addFinding({
      severity: 'CRITICAL',
      category: 'Obfuscation',
      line,
      evidence: `Base64 encoded payload decodes to dangerous content: "${payload.decoded.slice(0, 40)}"`,
      risk: 'Evasion of static security filters to execute arbitrary commands or access paths',
      recommendation: 'Disallow dynamic base64 decode-and-execute in runner',
    });
  }

  // Check 3: Check security rules table
  for (const rule of SECURITY_RULES) {
    const appliesToLang =
      rule.languages.includes('all') ||
      rule.languages.includes(langTag) ||
      (langTag === 'cpp' && rule.languages.includes('c')) ||
      (langTag === 'typescript' && rule.languages.includes('javascript'));

    if (!appliesToLang) continue;

    const match = rule.pattern.exec(sourceCode) || rule.pattern.exec(normalizedCode);
    if (match) {
      const line = getLineNumber(sourceCode, match.index);
      addFinding({
        severity: rule.severity,
        category: rule.category,
        line,
        evidence: `Detected ${rule.category} pattern: "${match[0]}"`,
        risk: rule.risk,
        recommendation: rule.recommendation,
      });
    }
  }

  // Determine overall safety and verdict
  const hasCritical = findings.some((f) => f.severity === 'CRITICAL');
  const hasHigh = findings.some((f) => f.severity === 'HIGH');
  const hasMedium = findings.some((f) => f.severity === 'MEDIUM');

  let verdict = 'SAFE';
  let safe_to_execute = true;
  let confidence = 98;

  if (hasCritical || hasHigh) {
    verdict = 'BLOCK';
    safe_to_execute = false;
    confidence = hasCritical ? 99 : 95;
  } else if (hasMedium || findings.length > 0) {
    verdict = 'SUSPICIOUS';
    safe_to_execute = false;
    confidence = 88;
  }

  return {
    safe_to_execute,
    confidence,
    verdict,
    findings,
  };
}

/**
 * Compatibility wrapper for worker.js and existing executor pipelines.
 *
 * @param {string} sourceCode - Raw user submitted code.
 * @param {number|string} languageId - Judge0 language ID.
 * @returns {object} { rejected, reason, verdict, confidence, findings }
 */
export function analyzeCode(sourceCode, languageId) {
  const audit = auditCode(sourceCode, languageId);
  const rejected = !audit.safe_to_execute || audit.verdict === 'BLOCK';
  let reason = null;

  if (rejected && audit.findings.length > 0) {
    const topFinding =
      audit.findings.find((f) => f.severity === 'CRITICAL') ||
      audit.findings.find((f) => f.severity === 'HIGH') ||
      audit.findings[0];
    reason = `${topFinding.category}: ${topFinding.evidence}`;
  }

  return {
    rejected,
    reason,
    verdict: audit.verdict,
    confidence: audit.confidence,
    findings: audit.findings,
  };
}

export default {
  auditCode,
  analyzeCode,
};
