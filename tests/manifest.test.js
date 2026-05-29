const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

function readPngSize(filePath) {
  const png = fs.readFileSync(filePath);

  assert.equal(png.toString('ascii', 1, 4), 'PNG');

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20)
  };
}

test('manifest is ready for a Manifest V3 Chrome Web Store upload', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'Image Zoom');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.ok(manifest.description.length <= 132);
  assert.equal(manifest.permissions, undefined);
  assert.equal(manifest.host_permissions, undefined);
});

test('content script uses narrow http and https matches only', () => {
  assert.deepEqual(manifest.content_scripts, [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['content.js'],
      css: ['styles.css'],
      run_at: 'document_idle'
    }
  ]);
});

test('manifest icon files exist at the declared PNG dimensions', () => {
  assert.deepEqual(manifest.icons, {
    16: 'icons/icon-16.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png'
  });

  for (const [size, iconPath] of Object.entries(manifest.icons)) {
    const dimensions = readPngSize(path.join(root, iconPath));

    assert.deepEqual(dimensions, {
      width: Number(size),
      height: Number(size)
    });
  }
});
