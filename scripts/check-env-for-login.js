/**
 * Check env vars required for login/session. Reports SET/MISSING (no values).
 * Optional: compare with Netlify env names if `netlify env:list` is available.
 * Run: node scripts/check-env-for-login.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REQUIRED_KEYS = [
  "JWT_SECRET_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const OPTIONAL_KEYS = ["SESSION_COOKIE_DOMAIN"];

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}

function main() {
  const root = path.resolve(__dirname, "..");
  const envLocal = loadEnvFile(path.join(root, ".env.local"));
  const envBase = loadEnvFile(path.join(root, ".env"));
  const combined = { ...envBase, ...envLocal };

  console.log("--- Local env (SET/MISSING) ---\n");
  for (const key of REQUIRED_KEYS) {
    const value = combined[key];
    const status = value !== undefined && String(value).trim() !== "" ? "SET" : "MISSING";
    console.log(`  ${key}: ${status}`);
  }
  for (const key of OPTIONAL_KEYS) {
    const value = combined[key];
    const status = value !== undefined && String(value).trim() !== "" ? "SET" : "(optional, not set)";
    console.log(`  ${key}: ${status}`);
  }

  let netlifyKeys = [];
  try {
    const out = execSync("netlify env:list --json 2>/dev/null || netlify env:list 2>/dev/null", {
      encoding: "utf8",
      cwd: root,
    });
    if (out.trim()) {
      try {
        const data = JSON.parse(out);
        netlifyKeys = Array.isArray(data) ? data.map((e) => (e.key != null ? e.key : e)) : [];
      } catch {
        netlifyKeys = out
          .split("\n")
          .map((line) => line.replace(/\s+.*$/, "").trim())
          .filter(Boolean);
      }
    }
  } catch {
    // Netlify CLI not available or not linked
  }

  if (netlifyKeys.length > 0) {
    console.log("\n--- Netlify env (names only) ---\n");
    const missingInNetlify = REQUIRED_KEYS.filter((k) => !netlifyKeys.includes(k));
    if (missingInNetlify.length > 0) {
      console.log("  Required keys missing in Netlify (set them in Netlify Dashboard):");
      missingInNetlify.forEach((k) => console.log(`    - ${k}`));
    } else {
      console.log("  All required keys present in Netlify list.");
    }
  }

  console.log("\n--- Post-Op checklist ---\n");
  console.log("  1. JWT secret sync: Ensure JWT_SECRET_KEY in Netlify matches local (exact same string) so cookie signature verification works.");
  console.log("  2. Supabase: Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY in Netlify match local and point to the same project.");
  console.log("  3. Inspect headers: After login, open DevTools → Network, click the login request, and check Response Headers for Set-Cookie; Domain should be empty (host-only).");
  console.log("");
}

main();
