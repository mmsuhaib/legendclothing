import fs from "fs";
import path from "path";

interface Issue {
  file: string;
  line: number;
  type: string;
  detail: string;
  snippet: string;
}

const SCAN_DIRS = ["components", "app"];

function scanFile(filePath: string): Issue[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const issues: Issue[] = [];

  // Check 1: Fixed widths without breakpoint (e.g. w-[500px] instead of md:w-[500px])
  const fixedWidthRegex = /(?<!(sm|md|lg|xl|2xl):)(?:^|[\s"'`])w-\[(\d{3,4})px\]/g;

  lines.forEach((line, idx) => {
    let match;
    while ((match = fixedWidthRegex.exec(line)) !== null) {
      const widthVal = parseInt(match[2], 10);
      // Fixed widths over 340px without breakpoint are risky for mobile
      if (widthVal > 340 && !line.includes("max-w-") && !line.includes("min-w-0")) {
        issues.push({
          file: filePath,
          line: idx + 1,
          type: "Unprefixed Fixed Width Trap",
          detail: `Found fixed width w-[${widthVal}px] which exceeds mobile viewport (320-375px)`,
          snippet: line.trim(),
        });
      }
    }
  });

  // Check 2: Table tags without overflow-x-auto container
  if (content.includes("<table") && !content.includes("overflow-x-auto") && !filePath.includes("node_modules")) {
    issues.push({
      file: filePath,
      line: 1,
      type: "Table Missing Horizontal Overflow Wrapper",
      detail: "Table rendered without an overflow-x-auto wrapper; will break mobile layout",
      snippet: "<table ...>",
    });
  }

  return issues;
}

function walkDir(dirPath: string): Issue[] {
  const issues: Issue[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        issues.push(...walkDir(full));
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      issues.push(...scanFile(full));
    }
  }

  return issues;
}

function main() {
  console.log("==================================================");
  console.log("  MOBILE & WEB RESPONSIVE DESIGN AUDIT            ");
  console.log("==================================================");

  let totalIssues = 0;
  for (const d of SCAN_DIRS) {
    const p = path.join(process.cwd(), d);
    if (fs.existsSync(p)) {
      const issues = walkDir(p);
      totalIssues += issues.length;
      for (const iss of issues) {
        console.warn(`[WARN] ${iss.file}:${iss.line}`);
        console.warn(`       Type: ${iss.type}`);
        console.warn(`       Detail: ${iss.detail}`);
        console.warn(`       Snippet: "${iss.snippet}"`);
      }
    }
  }

  console.log("\n--------------------------------------------------");
  if (totalIssues === 0) {
    console.log("✓ SUCCESS: Zero mobile overflow traps or uncontained tables found!");
    console.log("✓ Application conforms to Mobile-First & Responsive Design Skill.");
  } else {
    console.warn(`Found ${totalIssues} responsive warning(s) that should be reviewed.`);
  }
}

main();
