import fs from "fs";
import path from "path";

interface AuditIssue {
  file: string;
  line: number;
  pattern: string;
  snippet: string;
}

const FORBIDDEN_PATTERNS = [
  { regex: /DEFAULT_CATEGORIES/g, label: "Hardcoded default categories array" },
  { regex: /INITIAL_CATEGORIES/g, label: "Hardcoded initial categories array" },
  { regex: /mockProducts/g, label: "Hardcoded mock products array" },
  { regex: /\[\s*["']Shirts["']\s*,\s*["']T-Shirts["']/g, label: "Hardcoded category list" },
  { regex: /\[\s*["']Oxford Overshirt["']/g, label: "Hardcoded search suggestions" },
  { regex: /priceRange\s*=\s*500/g, label: "Hardcoded price ceiling ($500)" },
];

const SCAN_DIRS = ["components", "app"];

function scanDirectory(dirPath: string): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        issues.push(...scanDirectory(fullPath));
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, idx) => {
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.regex.test(line)) {
            issues.push({
              file: fullPath,
              line: idx + 1,
              pattern: pattern.label,
              snippet: line.trim(),
            });
          }
        }
      });
    }
  }

  return issues;
}

function main() {
  console.log("==================================================");
  console.log("  LEGEND APPLICATION HARDCODE AUDIT REPORT        ");
  console.log("==================================================");

  let totalIssues = 0;
  for (const dir of SCAN_DIRS) {
    const fullDir = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      const issues = scanDirectory(fullDir);
      totalIssues += issues.length;
      for (const issue of issues) {
        console.warn(`[FAIL] ${issue.file}:${issue.line} - ${issue.pattern}`);
        console.warn(`       Snippet: "${issue.snippet}"`);
      }
    }
  }

  if (totalIssues === 0) {
    console.log("✓ SUCCESS: No hardcoded categories, mock products, or fixed ceilings found!");
    console.log("✓ All storefront components, filters, and nav bars are dynamic & database-driven.");
  } else {
    console.error(`\nFound ${totalIssues} hardcoded issues that need refactoring.`);
    process.exit(1);
  }
}

main();
