import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const publicDir = path.resolve(projectRoot, 'public');

const { generateAssets, packIco, MASTER_SVG, MANIFEST_DATA } = await import(
  '../generate-favicons.js'
);

console.log('Testing asset generator functions...');

// 1. Verify MASTER_SVG content
assert.ok(typeof MASTER_SVG === 'string', 'MASTER_SVG must be a string');
assert.ok(MASTER_SVG.includes('<svg'), 'MASTER_SVG must include <svg');
assert.ok(MASTER_SVG.includes('#1a1a1a'), 'MASTER_SVG must include dark background pad #1a1a1a');
assert.ok(MASTER_SVG.includes('#FFA116'), 'MASTER_SVG must include brand orange #FFA116');
assert.ok(MASTER_SVG.includes('#282828'), 'MASTER_SVG must include brand slate #282828');

// 2. Verify MANIFEST_DATA structure
assert.equal(MANIFEST_DATA.short_name, 'CodePad', 'Manifest short_name must be CodePad');
assert.ok(MANIFEST_DATA.name.includes('CodePad'), 'Manifest name must contain CodePad');
assert.equal(MANIFEST_DATA.theme_color, '#1a1a1a', 'Manifest theme_color must be #1a1a1a');
assert.equal(MANIFEST_DATA.background_color, '#1a1a1a', 'Manifest background_color must be #1a1a1a');
assert.ok(Array.isArray(MANIFEST_DATA.icons), 'Manifest icons must be an array');

// 3. Test generateAssets execution
console.log('Running generateAssets()...');
const results = await generateAssets(publicDir);
assert.equal(results.length, 6, 'Should report 6 generated assets');

// 4. Verify public assets exist
const files = [
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'logo192.png',
  'logo512.png',
  'manifest.json'
];

for (const file of files) {
  const filePath = path.join(publicDir, file);
  assert.ok(fs.existsSync(filePath), `Expected ${file} to exist in ${publicDir}`);
}

// 5. Verify image dimensions with sharp
console.log('Validating PNG resolutions...');
const appleTouchMeta = await sharp(path.join(publicDir, 'apple-touch-icon.png')).metadata();
assert.equal(appleTouchMeta.width, 180, 'apple-touch-icon width must be 180');
assert.equal(appleTouchMeta.height, 180, 'apple-touch-icon height must be 180');
assert.equal(appleTouchMeta.format, 'png', 'apple-touch-icon format must be png');

const logo192Meta = await sharp(path.join(publicDir, 'logo192.png')).metadata();
assert.equal(logo192Meta.width, 192, 'logo192 width must be 192');
assert.equal(logo192Meta.height, 192, 'logo192 height must be 192');
assert.equal(logo192Meta.format, 'png', 'logo192 format must be png');

const logo512Meta = await sharp(path.join(publicDir, 'logo512.png')).metadata();
assert.equal(logo512Meta.width, 512, 'logo512 width must be 512');
assert.equal(logo512Meta.height, 512, 'logo512 height must be 512');
assert.equal(logo512Meta.format, 'png', 'logo512 format must be png');

// 6. Verify favicon.ico binary header and frames
console.log('Validating favicon.ico binary structure...');
const icoBuf = fs.readFileSync(path.join(publicDir, 'favicon.ico'));
assert.equal(icoBuf.readUInt16LE(0), 0, 'ICO reserved must be 0');
assert.equal(icoBuf.readUInt16LE(2), 1, 'ICO type must be 1 (icon)');
assert.equal(icoBuf.readUInt16LE(4), 3, 'ICO image count must be 3');

// Frame 1: 16x16
assert.equal(icoBuf.readUInt8(6), 16, 'Frame 1 width must be 16');
assert.equal(icoBuf.readUInt8(7), 16, 'Frame 1 height must be 16');
// Frame 2: 32x32
assert.equal(icoBuf.readUInt8(22), 32, 'Frame 2 width must be 32');
assert.equal(icoBuf.readUInt8(23), 32, 'Frame 2 height must be 32');
// Frame 3: 48x48
assert.equal(icoBuf.readUInt8(38), 48, 'Frame 3 width must be 48');
assert.equal(icoBuf.readUInt8(39), 48, 'Frame 3 height must be 48');

// 7. Verify manifest.json on disk
console.log('Validating manifest.json...');
const diskManifest = JSON.parse(fs.readFileSync(path.join(publicDir, 'manifest.json'), 'utf8'));
assert.equal(diskManifest.short_name, 'CodePad');
assert.equal(diskManifest.theme_color, '#1a1a1a');

console.log('All asset generation tests passed successfully!');
