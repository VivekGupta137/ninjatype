import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const version = pkg.version;

let readme = readFileSync('README.md', 'utf-8');
const updated = readme.replace(
  /version-\d+\.\d+\.\d+-blue\.svg/g,
  `version-${version}-blue.svg`
);

if (updated !== readme) {
  writeFileSync('README.md', updated);
  console.log(`✓ Updated README.md to version ${version}`);
} else {
  console.log(`✓ README.md already at version ${version}`);
}
