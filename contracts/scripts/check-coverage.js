const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const FLOORS = { statements: 90, branches: 90, functions: 95, lines: 95 };

const summary = JSON.parse(
  readFileSync(join(__dirname, "..", "coverage", "coverage-summary.json"), "utf8"),
);

const total = summary.total;
let failed = false;

for (const [metric, floor] of Object.entries(FLOORS)) {
  const pct = total[metric].pct;
  const ok = pct >= floor;
  if (!ok) failed = true;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${metric.padEnd(11)} ${String(pct).padStart(6)}%  (floor ${floor}%)`,
  );
}

if (failed) {
  console.error("\nCoverage floor not met.");
  process.exit(1);
}
