const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('public metadata points to the lowercase GitHub Pages site', () => {
  const listing = read('CHROMEWEBSTORE.md');

  assert.match(listing, /https:\/\/liewcf\.github\.io\/imagezoom\//);
  assert.match(listing, /https:\/\/liewcf\.github\.io\/imagezoom\/privacy\//);
  assert.match(listing, /https:\/\/github\.com\/liewcf\/imagezoom\/issues/);
});

test('public README does not include a private local install path', () => {
  const readme = read('README.md');

  assert.doesNotMatch(readme, /\/Users\/cheonfongliew\/Code\/projects\/ImageZoom/);
  assert.match(readme, /Choose this project folder/);
});

test('GitHub Pages site and privacy page are present', () => {
  const index = read('site/index.html');
  const privacy = read('site/privacy/index.html');

  assert.match(index, /<h1>Image Zoom<\/h1>/);
  assert.match(index, /privacy\//);
  assert.match(index, /store-assets\/screenshot-overlay-1280x800\.png/);
  assert.match(privacy, /Image Zoom Privacy Policy/);
  assert.match(privacy, /does not collect, store, sell, or share user data/);
});

test('GitHub Pages workflow deploys only the static site artifact', () => {
  const workflow = read('.github/workflows/pages.yml');

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: _site/);
});

test('local-only agent memory is ignored and MIT license is present', () => {
  const gitignore = read('.gitignore');
  const license = read('LICENSE');

  assert.match(gitignore, /^AGENTS\.md$/m);
  assert.match(gitignore, /^docs\/$/m);
  assert.match(license, /MIT License/);
  assert.match(license, /Copyright \(c\) 2026/);
});
