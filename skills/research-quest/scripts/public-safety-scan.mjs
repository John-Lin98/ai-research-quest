#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../../..");
const includeDist = process.argv.includes("--include-dist");
const requireApproved = process.argv.includes("--require-approved");

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const ignoredDirectories = new Set([
  ".git",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const sourceEntries = [
  "app",
  "public",
  "shared",
  "skills",
  "docs",
  ".github/workflows",
  "README.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES",
  "PRIVACY.md",
  "SECURITY.md",
  ".gitignore",
];

const trackedPublicPathAllowlist = [
  ".gitignore",
  "README.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES",
  "PRIVACY.md",
  "SECURITY.md",
  "shared/game-state.schema.json",
  "public/research-quest-demo-75s.webm",
];
const trackedPublicPathPrefixes = [
  ".github/workflows/",
  "app/",
  "public/demo-data/",
  "skills/research-quest/",
  "docs/usage/",
];

const exactAllowlist = new Map([
  [
    "app/tests/security-contract.spec.ts",
    new Set([
      ["user", "@example.test"].join(""),
      [String.raw`C:\\`, String.raw`Users\\research\\private.txt`].join(""),
      ["ghp", "_0123456789abcdef"].join(""),
    ]),
  ],
  [
    "app/tests/contract.spec.ts",
    new Set([["demo", "@example.com"].join("")]),
  ],
]);

const patterns = [
  {
    label: "shared conversation URL",
    regex: new RegExp(
      ["chatgpt", String.raw`\.com\/share\/`, String.raw`[0-9a-f-]{16,}`].join(""),
      "gi",
    ),
  },
  {
    label: "UUID",
    regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
  },
  {
    label: "email address",
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    label: "Windows private absolute path",
    regex: new RegExp(
      String.raw`\b[A-Za-z]:(?:\\\\|\\)(?:Users|Documents and Settings|ProgramData)(?:(?:\\\\|\\)[^\s"'<>]+)+`,
      "g",
    ),
  },
  {
    label: "Unix private absolute path",
    regex: /\/(?:Users|home|root|data\d*|mnt|etc|var)\/[^\s"'<>]+/gi,
  },
  {
    label: "credential-shaped token",
    regex: /\b(?:gh[pousr]_[A-Za-z0-9_]{8,}|github_pat_[A-Za-z0-9_]{8,}|sk-[A-Za-z0-9_-]{10,}|AIza[A-Za-z0-9_-]{10,})\b/g,
  },
  {
    label: "secret assignment",
    regex: /\b(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*["']?[^\s"']{6,}/gi,
    sourceOnly: true,
  },
  {
    label: "private workspace marker",
    regex: new RegExp(
      [
        "(?:",
        ["Obsidian", "Vault"].join(""),
        String.raw`|[\\/]\.agents[\\/]|[\\/]\.codex[\\/]attachments[\\/])`,
      ].join(""),
      "g",
    ),
  },
  {
    label: "legacy repository marker",
    regex: new RegExp(["ai-research-quest", "-demo"].join(""), "gi"),
  },
];

function normalizedPath(path) {
  return relative(repoRoot, path).replaceAll("\\", "/");
}

function collect(path, output, allowIgnoredRoot = false) {
  const info = statSync(path);
  if (info.isDirectory()) {
    if (!allowIgnoredRoot && ignoredDirectories.has(path.split(/[\\/]/).at(-1))) return;
    for (const entry of readdirSync(path)) collect(resolve(path, entry), output);
    return;
  }
  if (textExtensions.has(extname(path).toLowerCase()) || extname(path) === "") {
    output.push(path);
  }
}

function isAllowed(path, value) {
  return exactAllowlist.get(path)?.has(value) ?? false;
}

function assertScannerSelfTest() {
  const samples = [
    [
      "shared conversation URL",
      ["chatgpt", ".com/share/", ["aaaaaaaa", "-bbbb-4ccc-8ddd-eeeeeeeeeeee"].join("")].join(""),
    ],
    ["UUID", ["aaaaaaaa", "-bbbb-4ccc-8ddd-eeeeeeeeeeee"].join("")],
    ["email address", ["person", "@example.test"].join("")],
    ["Windows private absolute path", [String.raw`C:\\`, String.raw`Users\\person\\private.txt`].join("")],
    ["Unix private absolute path", ["/ho", "me/person/private.txt"].join("")],
    ["credential-shaped token", ["ghp", "_0123456789abcdef"].join("")],
    ["secret assignment", ["api", "_key=synthetic_value"].join("")],
    ["private workspace marker", ["Obsidian", "Vault"].join("")],
    ["legacy repository marker", ["ai-research-quest", "-demo"].join("")],
  ];
  for (const [label, value] of samples) {
    const pattern = patterns.find((item) => item.label === label);
    pattern.regex.lastIndex = 0;
    if (!pattern.regex.test(value)) {
      throw new Error(`PUBLIC_SAFETY_SCANNER_SELF_TEST_FAILED ${label}`);
    }
  }
  if (
    !isAllowed("app/tests/security-contract.spec.ts", ["user", "@example.test"].join("")) ||
    isAllowed("app/tests/security-contract.spec.ts", ["other", "@example.test"].join(""))
  ) {
    throw new Error("PUBLIC_SAFETY_ALLOWLIST_SELF_TEST_FAILED");
  }
}

function assertTrackedPublicPaths() {
  let tracked;
  try {
    tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).split(/\r?\n/).filter(Boolean);
  } catch {
    throw new Error("PUBLIC_PATH_ALLOWLIST_REQUIRES_GIT_CHECKOUT");
  }
  const unexpected = tracked.filter((path) =>
    !trackedPublicPathAllowlist.includes(path) &&
    !trackedPublicPathPrefixes.some((prefix) => path.startsWith(prefix)),
  );
  if (unexpected.length) {
    throw new Error(`PUBLIC_PATH_ALLOWLIST_FAILED\n${unexpected.join("\n")}`);
  }
}

function scan(paths) {
  const failures = [];
  let fileCount = 0;
  for (const path of paths) {
    const source = readFileSync(path, "utf8");
    if (source.includes("\0")) continue;
    fileCount += 1;
    const name = normalizedPath(path);
    for (const { label, regex, sourceOnly = false } of patterns) {
      if (sourceOnly && name.startsWith("app/dist/")) continue;
      regex.lastIndex = 0;
      for (const match of source.matchAll(regex)) {
        if (isAllowed(name, match[0])) continue;
        const line = source.slice(0, match.index).split(/\r?\n/).length;
        failures.push(`${name}:${line}: ${label}`);
      }
    }
  }
  if (failures.length) {
    throw new Error(`PUBLIC_SAFETY_SCAN_FAILED\n${failures.join("\n")}`);
  }
  return fileCount;
}

function assertMarkdownLinks(paths) {
  const failures = [];
  for (const path of paths.filter((item) => extname(item).toLowerCase() === ".md")) {
    const source = readFileSync(path, "utf8");
    const regex = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
    for (const match of source.matchAll(regex)) {
      const rawTarget = match[1].trim().replace(/^<|>$/g, "");
      if (
        rawTarget.startsWith("#") ||
        /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)
      ) {
        continue;
      }
      const target = decodeURIComponent(rawTarget.split("#", 1)[0]);
      if (!target || existsSync(resolve(dirname(path), target))) continue;
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      failures.push(`${normalizedPath(path)}:${line}: broken link ${rawTarget}`);
    }
  }
  if (failures.length) {
    throw new Error(`PUBLIC_MARKDOWN_LINKS_FAILED\n${failures.join("\n")}`);
  }
}

function assertApproval(path) {
  const value = JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
  if (value.privacy?.sanitization?.review_status !== "approved") {
    throw new Error(`${path}: privacy.sanitization.review_status must be approved`);
  }
  if (value.privacy?.real_research_results_included !== false) {
    throw new Error(`${path}: real_research_results_included must be false`);
  }
}

const paths = [];
assertScannerSelfTest();
assertTrackedPublicPaths();
for (const entry of sourceEntries) collect(resolve(repoRoot, entry), paths);
if (includeDist) {
  const dist = resolve(repoRoot, "app/dist");
  try {
    collect(dist, paths, true);
  } catch {
    throw new Error("app/dist is required when --include-dist is set");
  }
}

const scanned = scan(paths);
assertMarkdownLinks(paths);

if (requireApproved) {
  assertApproval("public/demo-data/default-game-state.json");
  for (const name of ["fixture-research.json", "fixture-software.json", "fixture-learning.json"]) {
    assertApproval(`skills/research-quest/references/${name}`);
  }
}

console.log(
  `PUBLIC_SAFETY_SCAN_OK files=${scanned} dist=${includeDist} approved=${requireApproved}`,
);
