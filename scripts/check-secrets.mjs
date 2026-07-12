import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
const root = new URL("..", import.meta.url);
const output = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: root, encoding: "utf8" },
);
const files = [...new Set(output.split("\0").filter(Boolean))];
const patterns = [
  [/sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style key"],
  [/(?:ghp|github_pat)_[A-Za-z0-9_]{20,}/, "GitHub token"],
  [
    /(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN)\s*=\s*[^\s#]{8,}/i,
    "Cloudflare token",
  ],
  [/RAILWAY_TOKEN\s*=\s*[^\s#]{8,}/i, "Railway token"],
  [/authorization\s*[:=]\s*["']?Bearer\s+[A-Za-z0-9._-]{12,}/i, "bearer token"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
  [
    /[A-Z][A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|APIKEY)[A-Z0-9_]*[ \t]*=[ \t]*(?!#|$)[^ \t\r\n]{12,}/,
    "high-risk environment assignment",
  ],
];
const binary = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".woff",
  ".woff2",
  ".pdf",
  ".zip",
]);
const findings = [];
for (const file of files) {
  if (
    binary.has(extname(file).toLowerCase()) ||
    file.endsWith("pnpm-lock.yaml")
  )
    continue;
  let text;
  try {
    text = readFileSync(new URL(file, root), "utf8");
  } catch {
    continue;
  }
  for (const [regex, label] of patterns) {
    const match = text.match(regex);
    if (match) findings.push(`${file}: ${label}`);
  }
}
if (findings.length) {
  console.error(
    "Potential secrets detected (values redacted):\n" + findings.join("\n"),
  );
  process.exit(1);
}
console.log(
  `Secret scan passed: ${files.length} project files checked; values never printed.`,
);
