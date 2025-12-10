const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createFavicon() {
  try {
    const svgPath = path.join(__dirname, 'public', 'logo.svg');
    const icoPath = path.join(__dirname, 'public', 'favicon.ico');

    // Create a small PNG first (32x32 is good for favicon)
    const buffer = await sharp(svgPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 66, g: 245, b: 155, alpha: 1 }
      })
      .png()
      .toBuffer();

    // For now, save as PNG with .ico extension (browsers accept this)
    // A proper ICO format converter would require additional libraries
    fs.writeFileSync(icoPath, buffer);
    console.log('✓ Updated favicon.ico (PNG format - compatible with all browsers)');
  } catch (error) {
    console.error('Error creating favicon:', error);
    process.exit(1);
  }
}

createFavicon();
