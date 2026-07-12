import fs from 'node:fs';
import path from 'node:path';
import { allUnits, quickPracticeTools } from '../src/data/curriculum';
import { allRewards } from '../src/data/rewards';

interface Finding {
  severity: 'error' | 'warning';
  scope: string;
  path: string;
  message: string;
}

const findings: Finding[] = [];
const reportPath = path.resolve('docs/assets-qa.md');

function publicPath(assetPath: string): string {
  return path.resolve('public', assetPath.replace(/^\//, ''));
}

function add(severity: Finding['severity'], scope: string, assetPath: string, message: string) {
  findings.push({ severity, scope, path: assetPath, message });
}

function assertExists(scope: string, assetPath: string) {
  if (!fs.existsSync(publicPath(assetPath))) add('error', scope, assetPath, 'missing public asset');
}

const staticAssets = [
  '/mascots/yangmung-duo-logo.webp',
  '/scenes/quick-practice/retry-missed.webp',
  '/scenes/quick-practice/retry-same.webp',
  '/scenes/quick-practice/dictation.webp',
];

for (const unit of allUnits) assertExists(`unit ${unit.id}`, unit.image);
for (const tool of quickPracticeTools) assertExists(`quick practice ${tool.title}`, tool.image);
for (const assetPath of staticAssets) assertExists('static ui', assetPath);

const rewards = allRewards();
const rewardImageCounts = new Map<string, number>();
for (const reward of rewards) {
  assertExists(`reward ${reward.unitId}`, reward.image);
  rewardImageCounts.set(reward.image, (rewardImageCounts.get(reward.image) ?? 0) + 1);
}

for (const [assetPath, count] of rewardImageCounts.entries()) {
  if (count > 1) add('error', 'reward duplicate', assetPath, `${count} rewards use the same image`);
}

const unitImageCounts = new Map<string, number>();
for (const unit of allUnits) unitImageCounts.set(unit.image, (unitImageCounts.get(unit.image) ?? 0) + 1);
for (const [assetPath, count] of unitImageCounts.entries()) {
  if (count > 8) add('warning', 'unit image reuse', assetPath, `${count} units share this image`);
}

const errors = findings.filter((finding) => finding.severity === 'error');
const warnings = findings.filter((finding) => finding.severity === 'warning');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(
  reportPath,
  [
    '# Asset QA Report',
    '',
    `- Units checked: ${allUnits.length}`,
    `- Quick practice tools checked: ${quickPracticeTools.length}`,
    `- Rewards checked: ${rewards.length}`,
    `- Unique reward images: ${rewardImageCounts.size}`,
    `- Errors: ${errors.length}`,
    `- Warnings: ${warnings.length}`,
    '',
    '## Findings',
    '',
    findings.length ? '| Severity | Scope | Path | Message |\n| --- | --- | --- | --- |' : 'No findings.',
    ...findings.map((finding) => `| ${finding.severity} | ${finding.scope} | ${finding.path.replace(/\|/g, '\\|')} | ${finding.message.replace(/\|/g, '\\|')} |`),
    '',
  ].join('\n'),
);

console.log(JSON.stringify({ errors: errors.length, warnings: warnings.length, reportPath }, null, 2));
if (errors.length > 0) process.exitCode = 1;
