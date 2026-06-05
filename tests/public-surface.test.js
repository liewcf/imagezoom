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

test('homepage has social preview metadata for link sharing', () => {
  const index = read('site/index.html');

  assert.match(index, /<link rel="canonical" href="https:\/\/liewcf\.github\.io\/imagezoom\/">/);
  assert.match(index, /<meta property="og:type" content="website">/);
  assert.match(index, /<meta property="og:url" content="https:\/\/liewcf\.github\.io\/imagezoom\/">/);
  assert.match(index, /<meta property="og:title" content="Image Zoom">/);
  assert.match(index, /<meta property="og:description" content="Image Zoom is a small Chrome extension for zooming images on web pages\.">/);
  assert.match(index, /<meta property="og:image" content="https:\/\/liewcf\.github\.io\/imagezoom\/store-assets\/screenshot-overlay-1280x800\.png">/);
  assert.match(index, /<meta property="og:image:width" content="1280">/);
  assert.match(index, /<meta property="og:image:height" content="800">/);
  assert.match(index, /<meta name="twitter:card" content="summary_large_image">/);
});

test('source site preview has the assets referenced by the homepage', () => {
  for (const asset of [
    'icons/icon-48.png',
    'store-assets/screenshot-overlay-1280x800.png',
  ]) {
    assert.ok(fs.existsSync(`site/${asset}`), `${asset} missing from site preview`);
    assert.deepEqual(fs.readFileSync(`site/${asset}`), fs.readFileSync(asset));
  }
});

test('homepage navigation and feature sections stay simple', () => {
  const index = read('site/index.html');

  assert.match(index, /<nav aria-label="Main">/);
  assert.doesNotMatch(index, /aria-label="Main navigation"/);
  assert.match(index, /\.sections\s*{[^}]*border-top:\s*0\.1rem solid var\(--line\)/s);
  assert.doesNotMatch(index, /section\s*{[^}]*background:\s*var\(--panel\)/s);
});

test('public copy describes double-click overlay activation', () => {
  const readme = read('README.md');
  const index = read('site/index.html');
  const listing = read('CHROMEWEBSTORE.md');

  assert.doesNotMatch(readme, /inline zoom|zoom it inline|zoom selected images inline/i);
  assert.doesNotMatch(index, /inline zoom|zoom inline|zoom selected images inline/i);
  assert.doesNotMatch(listing, /inline zoom|zoom it inline|zoom selected images inline/i);
  assert.doesNotMatch(index, /Hover over an image and scroll to zoom inline/);
  assert.doesNotMatch(readme, /After an image has been clicked once/);
  assert.doesNotMatch(index, /After clicking that image once/);
  assert.doesNotMatch(listing, /hover wheel zoom/i);
  assert.doesNotMatch(listing, /click-first/);
  assert.match(readme, /Double-click a useful image/);
  assert.match(index, /Double-click an unlinked image/);
  assert.match(listing, /Double-click a useful image/);
  assert.match(readme, /Linked images keep their normal page link click/);
  assert.match(index, /Linked images keep their normal link click/);
  assert.match(listing, /Linked images keep their normal page link click/);
});

test('GitHub Pages workflow deploys only the static site artifact', () => {
  const workflow = read('.github/workflows/pages.yml');

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: _site/);
  assert.match(workflow, /FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true/);
});

test('local-only agent memory is ignored and MIT license is present', () => {
  const gitignore = read('.gitignore');
  const license = read('LICENSE');

  assert.match(gitignore, /^AGENTS\.md$/m);
  assert.match(gitignore, /^docs\/$/m);
  assert.match(license, /MIT License/);
  assert.match(license, /Copyright \(c\) 2026/);
});
