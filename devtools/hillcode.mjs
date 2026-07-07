#!/usr/bin/env node
/** Hillcode · Citron Identity — Vite dev TUI + CLI */
import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const injectScript = join(__dirname, "inject.mjs");
const configPath = join(__dirname, "clients.json");

const NO_COLOR =
  (process.env.NO_COLOR != null && process.env.NO_COLOR !== "") ||
  process.env.CLICOLOR === "0";

function style(text, key) {
  if (NO_COLOR) return text;
  const C = { reset: "\x1b[0m", dim: "\x1b[2m", citron: "\x1b[38;2;217;188;88m", ok: "\x1b[32m", err: "\x1b[31m" };
  if (key === "brand") return C.citron + text + C.reset;
  if (key === "muted") return C.dim + text + C.reset;
  if (key === "ok") return C.ok + text + C.reset;
  if (key === "err") return C.err + text + C.reset;
  return text;
}

function parseArgs(argv) {
  const out = { help: false, setup: false, client: null, cmd: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--setup") out.setup = true;
    else if (a === "-c" || a === "--client") out.client = argv[++i] ?? null;
    else if (a === "--cmd") out.cmd = argv[++i] ?? null;
  }
  return out;
}

function loadConfig() {
  const raw = JSON.parse(readFileSync(configPath, "utf8"));
  const list = raw.clients ?? raw;
  return {
    projectName: raw.projectName ?? "Citron Identity",
    clients: list.map((c) => (typeof c === "string" ? { id: c, displayName: c } : c)),
  };
}

function printBanner(name) {
  console.log("\n  " + style("hillcode", "brand") + style(` · ${name}`, "muted"));
  console.log(style("  ─────────────────────────\n", "muted"));
}

function runInject(client) {
  return spawnSync(process.execPath, [injectScript, client], { cwd: repoRoot, stdio: "inherit" }).status === 0;
}

function runNpm(args) {
  const isWin = process.platform === "win32";
  return spawn(isWin ? "npm.cmd" : "npm", args, { cwd: repoRoot, stdio: "inherit", shell: isWin });
}

const VALID = new Set(["setup", "run", "web", "preview", "switch", "lint", "typecheck"]);

async function runCmd(cmd, client) {
  if (!VALID.has(cmd)) { console.error(`hillcode: unknown cmd: ${cmd}`); process.exit(1); }
  if (cmd === "setup") {
    const p = runNpm(["install"]);
    const code = await new Promise((r) => p.on("close", r));
    if (code !== 0) return code;
    return runInject(client) ? 0 : 1;
  }
  if (cmd !== "switch" && !runInject(client)) process.exit(1);
  if (cmd === "switch") { console.log(style(`  ✓ ${client}`, "ok")); return 0; }
  const map = { run: ["run", "dev"], web: ["run", "build"], preview: ["run", "preview"], lint: ["run", "lint"], typecheck: ["run", "type-check"] };
  const p = runNpm(map[cmd]);
  return new Promise((r) => p.on("close", (c) => r(c ?? 1)));
}

function ask(rl, q) { return new Promise((r) => rl.question(q, r)); }

async function pickClient(rl, clients) {
  if (clients.length === 1) return clients[0].id;
  clients.forEach((c, i) => console.log(`  ${style(String(i + 1), "brand")}  ${c.id} — ${style(c.displayName ?? c.id, "muted")}`));
  const n = parseInt((await ask(rl, style(`  client (1-${clients.length}): `, "muted"))).trim(), 10);
  return n >= 1 && n <= clients.length ? clients[n - 1].id : null;
}

async function tui(projectName, clients) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const loop = async () => {
    console.clear();
    printBanner(projectName);
    console.log(`  ${style("1", "brand")}  run      ${style("vite dev", "muted")}`);
    console.log(`  ${style("2", "brand")}  web      ${style("vite build", "muted")}`);
    console.log(`  ${style("3", "brand")}  preview  ${style("vite preview", "muted")}`);
    console.log(`  ${style("4", "brand")}  switch   ${style("inject client only", "muted")}`);
    console.log(`  ${style("0", "brand")}  setup    ${style("npm install + inject", "muted")}`);
    console.log(`  ${style("q", "muted")}  exit\n`);
    const choice = (await ask(rl, style("  > ", "brand"))).trim().toLowerCase();
    if (choice === "q" || !choice) { rl.close(); process.exit(0); }
    if (choice === "0" || choice === "setup") {
      const client = await pickClient(rl, clients);
      if (!client) { await ask(rl, "  [Enter]"); return loop(); }
      rl.close();
      process.exit(await runCmd("setup", client));
    }

    const client = await pickClient(rl, clients);
    if (!client) { await ask(rl, "  [Enter]"); return loop(); }
    let cmd =
      choice === "1" ? "run" :
      choice === "2" ? "web" :
      choice === "3" ? "preview" :
      choice === "4" ? "switch" : null;
    if (!cmd) { await ask(rl, "  [Enter]"); return loop(); }
    rl.close();
    process.exit(await runCmd(cmd, client));
  };
  await loop();
}

async function main() {
  if (!existsSync(join(repoRoot, "package.json"))) { console.error("hillcode: package.json missing"); process.exit(1); }
  const opts = parseArgs(process.argv);
  const { projectName, clients } = loadConfig();
  if (opts.help) {
    printBanner(projectName);
    console.log("  npm run hillcode -- -c citron --cmd run|web|preview|switch\n");
    process.exit(0);
  }
  if (opts.cmd) {
    const client = opts.client ?? clients[0]?.id;
    if (!client || !clients.some((c) => c.id === client)) { console.error("hillcode: invalid client"); process.exit(1); }
    process.exit(await runCmd(opts.cmd, client));
  }
  await tui(projectName, clients);
}

main().catch((e) => { console.error(e); process.exit(1); });
