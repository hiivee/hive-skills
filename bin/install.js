#!/usr/bin/env node
// hive-skills CLI — install skills into ~/.claude/skills/
// Usage: npx hive-skills install --skill <slug>
//        npx hive-skills list
//        npx hive-skills search <query>

const { execSync } = require("child_process");
const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");

const REGISTRY_URL = "https://raw.githubusercontent.com/hiivee/hive-skills/main/registry.json";
const GITHUB_RAW = "https://raw.githubusercontent.com/hiivee/hive-skills/main";
const SKILLS_DIR = path.join(os.homedir(), ".claude", "skills");

const args = process.argv.slice(2);
const command = args[0];

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "hive-skills-cli/1.0" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid JSON")); }
      });
    }).on("error", reject);
  });
}

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "hive-skills-cli/1.0" } }, (res) => {
      if (res.statusCode === 404) { reject(new Error("Not found")); return; }
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function installSkill(slug) {
  console.log(`\n  📦 Installing skill: ${slug}\n`);

  let registry;
  try {
    registry = await fetchJSON(REGISTRY_URL);
  } catch {
    console.error("  ❌ Failed to fetch registry. Check internet connection.");
    process.exit(1);
  }

  const skill = registry.skills.find((s) => s.slug === slug);
  if (!skill) {
    console.error(`  ❌ Skill "${slug}" not found in registry.`);
    console.log(`  Run: npx hive-skills list   to see all available skills\n`);
    process.exit(1);
  }

  const destDir = path.join(SKILLS_DIR, slug);
  fs.mkdirSync(destDir, { recursive: true });

  const skillUrl = `${GITHUB_RAW}/${skill.githubPath}`;
  let content;
  try {
    content = await fetchText(skillUrl);
  } catch {
    console.error(`  ❌ Failed to download skill file from GitHub.`);
    process.exit(1);
  }

  fs.writeFileSync(path.join(destDir, "SKILL.md"), content);

  console.log(`  ✅ Installed: ~/.claude/skills/${slug}/SKILL.md`);
  console.log(`  🏷  Category: ${skill.category}  |  Source: ${skill.source}`);
  if (skill.description) {
    console.log(`  📝 ${skill.description.slice(0, 100)}${skill.description.length > 100 ? "…" : ""}`);
  }
  console.log(`\n  Use with: /${slug}\n`);
}

async function listSkills(filter) {
  let registry;
  try {
    registry = await fetchJSON(REGISTRY_URL);
  } catch {
    console.error("  ❌ Failed to fetch registry.");
    process.exit(1);
  }

  const skills = filter
    ? registry.skills.filter((s) => s.category === filter || s.slug.includes(filter) || s.name?.toLowerCase().includes(filter))
    : registry.skills;

  const byCategory = {};
  for (const s of skills) {
    (byCategory[s.category] = byCategory[s.category] || []).push(s);
  }

  console.log(`\n  🐝 Hive Skills Registry — ${skills.length} skills\n`);
  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`  ${cat.toUpperCase()} (${items.length})`);
    for (const s of items) {
      console.log(`    ${s.slug.padEnd(32)} ${(s.description || "").slice(0, 60)}`);
    }
    console.log();
  }
  console.log(`  Install: npx hive-skills install --skill <slug>\n`);
}

async function installAll() {
  let registry;
  try {
    registry = await fetchJSON(REGISTRY_URL);
  } catch {
    console.error("  ❌ Failed to fetch registry.");
    process.exit(1);
  }
  console.log(`\n  📦 Installing all ${registry.skills.length} skills...\n`);
  for (const skill of registry.skills) {
    await installSkill(skill.slug);
  }
  console.log(`\n  ✅ All ${registry.skills.length} skills installed.\n`);
}

// Main
(async () => {
  if (command === "install") {
    const skillFlag = args.indexOf("--skill");
    const allFlag = args.includes("--all");
    if (allFlag) {
      await installAll();
    } else if (skillFlag >= 0 && args[skillFlag + 1]) {
      await installSkill(args[skillFlag + 1]);
    } else {
      console.log("  Usage: npx hive-skills install --skill <slug>");
      console.log("         npx hive-skills install --all");
    }
  } else if (command === "list" || command === "ls") {
    await listSkills(args[1]);
  } else if (command === "search") {
    await listSkills(args[1]);
  } else {
    console.log(`
  🐝 hive-skills — Hive Technology Skills Registry

  Commands:
    install --skill <slug>    Install a specific skill
    install --all             Install all skills
    list [category]           List available skills
    search <query>            Search skills

  Examples:
    npx hive-skills install --skill ai-cold-outreach
    npx hive-skills install --skill codenavi
    npx hive-skills list sales
    npx hive-skills search pricing

  Gallery: https://hub.hivetechnology.io/skills
`);
  }
})();
