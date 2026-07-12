import fs from 'node:fs';
import path from 'node:path';

interface SizeEntry {
  path: string;
  bytes: number;
  files: number;
}

const targets = [
  'dist',
  'dist/assets',
  'dist/audio',
  'dist/audio/nanami',
  'dist/gacha',
  'dist/mascots',
  'dist/scenes',
];
const jsonReportPath = path.resolve('docs/build-asset-report.json');
const markdownReportPath = path.resolve('docs/build-asset-report.md');
const audioSubsetReportPath = path.resolve('docs/audio-subset-report.json');

function collectSize(target: string): SizeEntry {
  const root = path.resolve(target);
  if (!fs.existsSync(root)) return { path: target, bytes: 0, files: 0 };
  if (fs.statSync(root).isFile()) return { path: target, bytes: fs.statSync(root).size, files: 1 };
  let bytes = 0;
  let files = 0;
  for (const entry of fs.readdirSync(root, { recursive: true })) {
    const fullPath = path.join(root, String(entry));
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) continue;
    bytes += fs.statSync(fullPath).size;
    files += 1;
  }
  return { path: target, bytes, files };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  for (const unit of units) {
    if (size < 1024) return `${size.toFixed(size >= 10 ? 1 : 2)} ${unit}`;
    size /= 1024;
  }
  return `${size.toFixed(1)} TB`;
}

const sizes = targets.map(collectSize);
const audioSubset = fs.existsSync(audioSubsetReportPath)
  ? JSON.parse(fs.readFileSync(audioSubsetReportPath, 'utf8')) as {
      requiredUniqueSessionTexts: number;
      expectedMp3Files: number;
      actualMp3Files: number;
      extraFiles: number;
      missingFiles: number;
      actualBytes: number;
      ok: boolean;
    }
  : undefined;

fs.mkdirSync(path.dirname(jsonReportPath), { recursive: true });
fs.writeFileSync(jsonReportPath, JSON.stringify({ sizes, audioSubset }, null, 2) + '\n');
fs.writeFileSync(
  markdownReportPath,
  [
    '# Build Asset Report',
    '',
    '## Current Build',
    '',
    '`npm run build` runs TypeScript, Vite production build, dist audio pruning, exact audio subset audit, and this size report.',
    '',
    '## Size Summary',
    '',
    '| Area | Files | Bytes | Human |',
    '| --- | ---: | ---: | ---: |',
    ...sizes.map((entry) => `| \`${entry.path}\` | ${entry.files} | ${entry.bytes} | ${formatBytes(entry.bytes)} |`),
    '',
    '## Audio Subset',
    '',
    audioSubset
      ? [
          '| Metric | Count |',
          '| --- | ---: |',
          `| Required unique session texts | ${audioSubset.requiredUniqueSessionTexts} |`,
          `| Expected mp3 files | ${audioSubset.expectedMp3Files} |`,
          `| Actual mp3 files | ${audioSubset.actualMp3Files} |`,
          `| Missing files | ${audioSubset.missingFiles} |`,
          `| Extra files | ${audioSubset.extraFiles} |`,
          `| Actual mp3 bytes | ${audioSubset.actualBytes} |`,
          `| Status | ${audioSubset.ok ? 'PASS' : 'FAIL'} |`,
        ].join('\n')
      : 'Audio subset report has not been generated yet.',
    '',
    '## Guardrail',
    '',
    'The production build publishes only audio referenced by the current learning sessions. The subset audit fails the build if any required mp3 is missing or if unreferenced mp3 files remain in `dist/audio`.',
    '',
  ].join('\n'),
);

console.log(JSON.stringify({ sizes, audioSubset, jsonReportPath, markdownReportPath }, null, 2));
