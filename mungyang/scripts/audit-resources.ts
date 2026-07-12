import fs from 'node:fs';
import path from 'node:path';
import { allUnits, quickPracticeTools } from '../src/data/curriculum';
import { allRewards } from '../src/data/rewards';

interface ResourceRow {
  scope: string;
  publicPath: string;
  fullPath: string;
  expected: 'file' | 'directory';
  exists: boolean;
  isExpectedType: boolean;
  symlinkBacked: boolean;
  bytes: number;
}

const reportPath = path.resolve('docs/resource-links.md');
const jsonReportPath = path.resolve('docs/resource-links.json');

const staticAssets = [
  '/mascots/yangmung-duo-logo.webp',
  '/scenes/quick-practice/retry-missed.webp',
  '/scenes/quick-practice/retry-same.webp',
  '/scenes/quick-practice/dictation.webp',
];

const rootResources: Array<{ scope: string; publicPath: string; expected: 'file' | 'directory' }> = [
  { scope: 'audio manifest', publicPath: '/audio/manifest.json', expected: 'file' },
  { scope: 'mascot assets', publicPath: '/mascots', expected: 'directory' },
  { scope: 'scene assets', publicPath: '/scenes/quick-practice', expected: 'directory' },
  { scope: 'gacha item assets', publicPath: '/gacha/items/generated-v2', expected: 'directory' },
];

function toFullPath(publicPath: string): string {
  return path.resolve('public', publicPath.replace(/^\//, ''));
}

function hasSymlinkSegment(fullPath: string): boolean {
  const root = path.resolve('public');
  const relative = path.relative(root, fullPath);
  let cursor = root;
  for (const segment of relative.split(path.sep)) {
    if (!segment) continue;
    cursor = path.join(cursor, segment);
    if (fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink()) return true;
  }
  return false;
}

function fileBytes(fullPath: string): number {
  if (!fs.existsSync(fullPath)) return 0;
  const stat = fs.statSync(fullPath);
  if (stat.isFile()) return stat.size;
  if (!stat.isDirectory()) return 0;
  return fs.readdirSync(fullPath, { recursive: true }).reduce((sum, entry) => {
    const childPath = path.join(fullPath, String(entry));
    if (!fs.existsSync(childPath) || !fs.statSync(childPath).isFile()) return sum;
    return sum + fs.statSync(childPath).size;
  }, 0);
}

function row(scope: string, publicPath: string, expected: ResourceRow['expected']): ResourceRow {
  const fullPath = toFullPath(publicPath);
  const exists = fs.existsSync(fullPath);
  const stat = exists ? fs.statSync(fullPath) : undefined;
  const isExpectedType = Boolean(expected === 'file' ? stat?.isFile() : stat?.isDirectory());
  return {
    scope,
    publicPath,
    fullPath,
    expected,
    exists,
    isExpectedType,
    symlinkBacked: exists ? hasSymlinkSegment(fullPath) : false,
    bytes: fileBytes(fullPath),
  };
}

function uniqueRows(rows: ResourceRow[]): ResourceRow[] {
  return Array.from(new Map(rows.map((entry) => [`${entry.expected}:${entry.publicPath}`, entry])).values()).sort((a, b) =>
    a.publicPath.localeCompare(b.publicPath),
  );
}

const requiredAssetPaths = [
  ...allUnits.map((unit) => ({ scope: `unit ${unit.id}`, publicPath: unit.image })),
  ...quickPracticeTools.map((tool) => ({ scope: `quick practice ${tool.title}`, publicPath: tool.image })),
  ...allRewards().map((reward) => ({ scope: `reward ${reward.unitId}`, publicPath: reward.image })),
  ...staticAssets.map((publicPath) => ({ scope: 'static ui', publicPath })),
];

const roots = rootResources.map((resource) => row(resource.scope, resource.publicPath, resource.expected));
const assets = uniqueRows(requiredAssetPaths.map((asset) => row(asset.scope, asset.publicPath, 'file')));
const allRows = [...roots, ...assets];
const missing = allRows.filter((entry) => !entry.exists || !entry.isExpectedType);
const symlinkBacked = allRows.filter((entry) => entry.symlinkBacked);
const totalBytes = assets.reduce((sum, entry) => sum + entry.bytes, 0);

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(
  jsonReportPath,
  JSON.stringify(
    {
      rootResources: roots.length,
      requiredAssets: assets.length,
      missing: missing.length,
      symlinkBacked: symlinkBacked.length,
      totalRequiredAssetBytes: totalBytes,
      missingRows: missing,
    },
    null,
    2,
  ) + '\n',
);
fs.writeFileSync(
  reportPath,
  [
    '# Resource Availability Report',
    '',
    '`mungyang/public` is checked by required runtime assets, not by symlink shape. This passes whether assets are copied as real files or exposed through development links.',
    '',
    `- Root resources checked: ${roots.length}`,
    `- Required asset files checked: ${assets.length}`,
    `- Missing or wrong type: ${missing.length}`,
    `- Symlink-backed paths: ${symlinkBacked.length}`,
    `- Required asset bytes: ${totalBytes}`,
    '',
    '## Root Resources',
    '',
    '| Scope | Path | Expected | Status |',
    '| --- | --- | --- | --- |',
    ...roots.map((entry) => `| ${entry.scope} | ${entry.publicPath} | ${entry.expected} | ${entry.exists && entry.isExpectedType ? 'ok' : 'missing'} |`),
    '',
    '## Missing',
    '',
    missing.length ? '| Scope | Path | Expected |\n| --- | --- | --- |' : 'No missing resources.',
    ...missing.map((entry) => `| ${entry.scope} | ${entry.publicPath.replace(/\|/g, '\\|')} | ${entry.expected} |`),
    '',
    '## Guardrail',
    '',
    'This report intentionally does not require symbolic links. The production build separately prunes and audits `dist/audio` so copied source audio cannot bloat the deploy output.',
    '',
  ].join('\n'),
);

console.log(
  JSON.stringify(
    {
      rootResources: roots.length,
      requiredAssets: assets.length,
      missing: missing.length,
      symlinkBacked: symlinkBacked.length,
      totalRequiredAssetBytes: totalBytes,
      reportPath,
      jsonReportPath,
    },
    null,
    2,
  ),
);

if (missing.length > 0) process.exit(1);
