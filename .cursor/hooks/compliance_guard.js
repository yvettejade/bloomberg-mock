#!/usr/bin/env node
// compliance-guard: a beforeShellExecution ("before_execute") hook for the
// financial demo. Cursor passes the agent's intended shell command as JSON on
// stdin (e.g. {"command":"cat .env", ...}). This script scans the command's
// terminal arguments for blacklisted financial patterns and uses exit codes to
// decide the outcome:
//
//   exit 0  -> compliant, allow the command to proceed
//   exit 1  -> COMPLIANCE VIOLATION, terminate the command
//
// IMPORTANT: exit code 1 only terminates the command because the hook entry in
// .cursor/hooks.json sets "failClosed": true. Without failClosed, a non-zero
// exit would fail OPEN and the command would still run.
const fs = require("fs");

function readStdin() {
  try {
    // fd 0 is stdin; read synchronously so the decision is deterministic.
    return fs.readFileSync(0, "utf8");
  } catch (_) {
    return "";
  }
}

let input = {};
try {
  const raw = readStdin();
  input = raw ? JSON.parse(raw) : {};
} catch (_) {
  input = {};
}

// The terminal arguments Cursor is about to execute. Fall back to process.argv
// so the script can also be exercised directly from a shell for testing.
const intendedCommand = String(
  input.command || process.argv.slice(2).join(" ")
).toLowerCase();

// Blacklisted financial patterns: secrets file, identity provider, credential
// keywords, and permission changes.
const blacklistedPatterns = [
  ".env",
  "okta",
  "password",
  "secret",
  "permissions",
];

const violations = blacklistedPatterns.filter((pattern) =>
  intendedCommand.includes(pattern)
);

if (violations.length > 0) {
  console.error(
    `\n\u274C COMPLIANCE VIOLATION BLOCKED: Command contains restricted financial data access [${violations.join(
      ", "
    )}].`
  );
  process.exit(1); // failClosed:true makes this terminate the command
}

// Compliant: allow the command to proceed. We MUST emit a valid JSON ack here:
// because the hook runs failClosed, an empty/invalid stdout would itself be
// treated as a failure and block the command.
process.stdout.write(JSON.stringify({ permission: "allow" }));
process.exit(0);
