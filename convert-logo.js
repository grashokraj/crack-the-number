const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  try {
    const svgPath = path.join(__dirname, 'public', 'logo.svg');
    const logo192Path = path.join(__dirname, 'public', 'logo192.png');
    const logo512Path = path.join(__dirname, 'public', 'logo512.png');
    const faviconPath = path.join(__dirname, 'public', 'favicon.ico');

    // Create 192x192 PNG
    await sharp(svgPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(logo192Path);
    console.log('✓ Created logo192.png');

    // Create 512x512 PNG
    await sharp(svgPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(logo512Path);
    console.log('✓ Created logo512.png');

    // Create favicon (64x64, then convert to ICO format)
    await sharp(svgPath)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    console.log('✓ Created favicon.png (use favicon converter tool for .ico)');

    console.log('\nAll logos created successfully!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    process.exit(1);
  }
}

convertSvgToPng();
