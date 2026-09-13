import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

/**
 * CodePad Master SVG
 * Vector icon badge with 108px rounded-corner dark background pad (#1a1a1a)
 * and centered CodePad vector editor glyph (2.2x scale, equal padding).
 */
export const MASTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="108" fill="#1a1a1a"/>
  <g transform="translate(80 63.5) scale(2.2)">
    <!-- Editor frame -->
    <path
      d="M20 10H125L160 45V145C160 156.046 151.046 165 140 165H20C8.954 165 0 156.046 0 145V30C0 18.954 8.954 10 20 10Z"
      fill="#282828"
    />

    <!-- Orange folded corner -->
    <path
      d="M125 10V35C125 46.046 133.954 55 145 55H160L125 10Z"
      fill="#FFA116"
    />

    <!-- Inner editor -->
    <rect
      x="12"
      y="52"
      width="136"
      height="101"
      rx="10"
      fill="white"
    />

    <!-- Window dots -->
    <circle cx="28" cy="34" r="5" fill="#FFA116"/>
    <circle cx="44" cy="34" r="5" fill="#B3B3B3"/>
    <circle cx="60" cy="34" r="5" fill="#B3B3B3"/>

    <!-- < -->
    <path
      d="M48 82L34 96L48 110"
      stroke="#FFA116"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- / -->
    <path
      d="M82 78L70 114"
      stroke="#282828"
      stroke-width="8"
      stroke-linecap="round"
    />

    <!-- > -->
    <path
      d="M104 82L118 96L104 110"
      stroke="#FFA116"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>`;

/**
 * Web App Manifest configuration for CodePad
 */
export const MANIFEST_DATA = {
  short_name: 'CodePad',
  name: 'CodePad - Online Code Editor & IDE',
  description: 'Fast sandboxed code execution engine and editor',
  icons: [
    {
      src: 'favicon.ico',
      sizes: '48x48 32x32 16x16',
      type: 'image/x-icon'
    },
    {
      src: 'apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png'
    },
    {
      src: 'logo192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: 'logo512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    }
  ],
  start_url: '.',
  display: 'standalone',
  theme_color: '#1a1a1a',
  background_color: '#1a1a1a'
};

/**
 * Pack multiple PNG image frames into a valid multi-resolution ICO file buffer.
 *
 * @param {Array<{width: number, height: number, buffer: Buffer}>} frames
 * @returns {Buffer} Valid ICO binary buffer
 */
export function packIco(frames) {
  const count = frames.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const entries = frames.map((frame) => {
    const entry = {
      width: frame.width >= 256 ? 0 : frame.width,
      height: frame.height >= 256 ? 0 : frame.height,
      colorCount: 0,
      reserved: 0,
      planes: 1,
      bpp: 32,
      size: frame.buffer.length,
      offset: offset,
      buffer: frame.buffer
    };
    offset += frame.buffer.length;
    return entry;
  });

  const out = Buffer.alloc(offset);

  // ICONDIR header
  out.writeUInt16LE(0, 0); // Reserved (must be 0)
  out.writeUInt16LE(1, 2); // 1 = ICO resource
  out.writeUInt16LE(count, 4); // Number of images

  let entryOffset = headerSize;
  for (const entry of entries) {
    out.writeUInt8(entry.width, entryOffset + 0);
    out.writeUInt8(entry.height, entryOffset + 1);
    out.writeUInt8(entry.colorCount, entryOffset + 2);
    out.writeUInt8(entry.reserved, entryOffset + 3);
    out.writeUInt16LE(entry.planes, entryOffset + 4);
    out.writeUInt16LE(entry.bpp, entryOffset + 6);
    out.writeUInt32LE(entry.size, entryOffset + 8);
    out.writeUInt32LE(entry.offset, entryOffset + 12);

    entry.buffer.copy(out, entry.offset);
    entryOffset += dirEntrySize;
  }

  return out;
}

/**
 * Generate all 6 public assets into target directory
 *
 * @param {string} targetDir Destination directory (e.g. client/public)
 * @returns {Promise<Array<{file: string, size: number}>>}
 */
export async function generateAssets(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  const generated = [];

  const svgBuffer = Buffer.from(MASTER_SVG.trim() + '\n', 'utf8');

  // 1. favicon.svg
  const svgPath = path.join(targetDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgBuffer);
  generated.push({ file: 'favicon.svg', size: svgBuffer.length });

  // 2. apple-touch-icon.png (180x180)
  const appleTouchPath = path.join(targetDir, 'apple-touch-icon.png');
  const appleTouchBuf = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(appleTouchPath, appleTouchBuf);
  generated.push({ file: 'apple-touch-icon.png', size: appleTouchBuf.length });

  // 3. logo192.png (192x192)
  const logo192Path = path.join(targetDir, 'logo192.png');
  const logo192Buf = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(logo192Path, logo192Buf);
  generated.push({ file: 'logo192.png', size: logo192Buf.length });

  // 4. logo512.png (512x512)
  const logo512Path = path.join(targetDir, 'logo512.png');
  const logo512Buf = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(logo512Path, logo512Buf);
  generated.push({ file: 'logo512.png', size: logo512Buf.length });

  // 5. favicon.ico (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const frames = [];
  for (const size of icoSizes) {
    const frameBuf = await sharp(svgBuffer).resize(size, size).png().toBuffer();
    frames.push({ width: size, height: size, buffer: frameBuf });
  }
  const icoBuf = packIco(frames);
  const icoPath = path.join(targetDir, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuf);
  generated.push({ file: 'favicon.ico', size: icoBuf.length });

  // 6. manifest.json
  const manifestPath = path.join(targetDir, 'manifest.json');
  const manifestContent = JSON.stringify(MANIFEST_DATA, null, 2) + '\n';
  fs.writeFileSync(manifestPath, manifestContent, 'utf8');
  generated.push({ file: 'manifest.json', size: Buffer.byteLength(manifestContent) });

  return generated;
}

// CLI Execution
const __filename = fileURLToPath(import.meta.url);
const isDirectCall = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectCall) {
  const defaultTargetDir = path.resolve(path.dirname(__filename), '../public');
  console.log(`Generating CodePad branding assets in ${defaultTargetDir}...`);

  generateAssets(defaultTargetDir)
    .then((results) => {
      for (const res of results) {
        console.log(`✓ Generated ${res.file} (${res.size} bytes)`);
      }
      console.log(`\nSuccessfully generated all ${results.length} public branding assets!`);
    })
    .catch((err) => {
      console.error('Error generating assets:', err);
      process.exit(1);
    });
}
