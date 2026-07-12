import fs from 'node:fs';
import path from 'node:path';

interface LinkRow {
  link: string;
  target: string;
  ok: boolean;
}

const reportPath = path.resolve('docs/resource-links.md');
const expectedLinks = [
  'public/audio',
  'public/mascots',
  'public/scenes/quick-practice',
];

function readLink(linkPath: string): LinkRow {
  const fullPath = path.resolve(linkPath);
  const target = fs.readlinkSync(fullPath);
  const resolved = path.resolve(path.dirname(fullPath), target);
  return {
    link: linkPath,
    target,
    ok: fs.existsSync(resolved),
  };
}

const topLevelLinks = expectedLinks.map(readLink);
const gachaLinks = fs
  .readdirSync(path.resolve('public/gacha/items/generated-v2'))
  .filter((name) => name.endsWith('.webp'))
  .map((name) => readLink(path.join('public/gacha/items/generated-v2', name)));

const allLinks = [...topLevelLinks, ...gachaLinks];
const broken = allLinks.filter((row) => !row.ok);

fs.writeFileSync(
  reportPath,
  [
    '# Resource Link Report',
    '',
    '`mungyang/public` intentionally reuses selected `yangmung/public` assets through symlinks during development.',
    '',
    `- Top-level links: ${topLevelLinks.length}`,
    `- Gacha item links: ${gachaLinks.length}`,
    `- Broken links: ${broken.length}`,
    '',
    '## Top-Level Links',
    '',
    '| Link | Target | Status |',
    '| --- | --- | --- |',
    ...topLevelLinks.map((row) => `| ${row.link} | ${row.target} | ${row.ok ? 'ok' : 'missing'} |`),
    '',
    '## Guardrail',
    '',
    '`npm run build` still prunes audio after Vite copies symlinked assets, so production output contains only audio referenced by current learning sessions.',
    '',
  ].join('\n'),
);

console.log(JSON.stringify({ topLevelLinks: topLevelLinks.length, gachaLinks: gachaLinks.length, broken: broken.length, reportPath }, null, 2));
if (broken.length > 0) process.exitCode = 1;
