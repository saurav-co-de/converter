import { readdir, readFile } from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const scriptName = process.argv[2];

if (!scriptName) {
  console.error("Usage: node scripts/run-workspaces.mjs <script>");
  process.exit(1);
}

const rootDir = process.cwd();
const rootPackage = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
const workspacePatterns = rootPackage.workspaces ?? [];
const workspaces = await loadWorkspaces(rootDir, workspacePatterns, scriptName);

if (workspaces.length === 0) {
  console.log(`No workspaces expose "${scriptName}".`);
  process.exit(0);
}

const workspaceByName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));

for (const workspace of workspaces) {
  workspace.dependencies = workspace.localDependencyNames
    .map((name) => workspaceByName.get(name))
    .filter(Boolean);
  workspace.remainingDependencies = workspace.dependencies.length;
}

const concurrency = Math.max(1, Math.min(cpus().length, workspaces.length));
const readyQueue = workspaces
  .filter((workspace) => workspace.remainingDependencies === 0)
  .sort(compareWorkspaces);

const running = new Map();
const completed = new Set();
let failed = false;

while ((readyQueue.length > 0 || running.size > 0) && !failed) {
  while (readyQueue.length > 0 && running.size < concurrency) {
    const workspace = readyQueue.shift();
    running.set(workspace.name, runWorkspaceScript(rootDir, workspace, scriptName));
  }

  const { name, code } = await Promise.race(running.values());
  running.delete(name);

  if (code !== 0) {
    failed = true;
    break;
  }

  completed.add(name);

  for (const workspace of workspaces) {
    if (completed.has(workspace.name) || running.has(workspace.name)) {
      continue;
    }

    const remaining = workspace.dependencies.filter((dependency) => !completed.has(dependency.name)).length;
    workspace.remainingDependencies = remaining;

    if (remaining === 0 && !readyQueue.some((candidate) => candidate.name === workspace.name)) {
      readyQueue.push(workspace);
      readyQueue.sort(compareWorkspaces);
    }
  }
}

if (failed) {
  await Promise.allSettled(running.values());
  process.exit(1);
}

console.log(`Finished "${scriptName}" across ${completed.size} workspace(s).`);

async function loadWorkspaces(root, patterns, targetScript) {
  const discovered = [];

  for (const pattern of patterns) {
    const [baseDir, wildcard] = pattern.split("/");

    if (wildcard !== "*") {
      throw new Error(`Unsupported workspace pattern: ${pattern}`);
    }

    const absoluteBaseDir = path.join(root, baseDir);
    const entries = await readdir(absoluteBaseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const directory = path.join(absoluteBaseDir, entry.name);
      const packageJsonPath = path.join(directory, "package.json");
      const manifest = JSON.parse(await readFile(packageJsonPath, "utf8"));

      if (!manifest.scripts?.[targetScript]) {
        continue;
      }

      discovered.push({
        name: manifest.name,
        directory,
        localDependencyNames: collectLocalDependencies(manifest),
        dependencies: [],
        remainingDependencies: 0
      });
    }
  }

  return discovered.sort(compareWorkspaces);
}

function collectLocalDependencies(manifest) {
  return Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies
  }).filter((dependencyName) => dependencyName.startsWith("@pdf-platform/"));
}

function runWorkspaceScript(root, workspace, targetScript) {
  console.log(`[start] ${workspace.name}`);

  return new Promise((resolve) => {
    const child = spawn(
      "npm",
      ["run", targetScript, "--workspace", workspace.name],
      {
        cwd: root,
        stdio: "inherit",
        shell: process.platform === "win32"
      }
    );

    child.on("exit", (code) => {
      console.log(`${code === 0 ? "[done]" : "[fail]"} ${workspace.name}`);
      resolve({ name: workspace.name, code: code ?? 1 });
    });
  });
}

function compareWorkspaces(left, right) {
  return left.name.localeCompare(right.name);
}
