const { createCanvas } = (() => {
  try { return require('canvas'); } catch { return { createCanvas: null }; }
})();

const fs = require('fs');
const { execSync } = require('child_process');

function generatePNG(size, filename, hasBg = true) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${hasBg ? `<defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06B6D4"/>
      <stop offset="50%" style="stop-color:#3B82F6"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bg)"/>` : ''}
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" 
    font-family="Arial,sans-serif" font-weight="900" font-size="${size * 0.55}" 
    fill="white">W</text>
</svg>`;
  fs.writeFileSync(filename.replace('.png', '.svg'), svg);
  console.log(`Created ${filename.replace('.png', '.svg')}`);
}

generatePNG(1024, 'assets/icon.svg', true);
generatePNG(1024, 'assets/icon_foreground.svg', false);
console.log('\nSVG icons created. Converting to PNG...');
console.log('Use an online SVG-to-PNG converter or install Inkscape to convert.');
console.log('For now, flutter_launcher_icons needs PNG files in assets/icon.png');
