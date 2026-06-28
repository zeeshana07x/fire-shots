const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'public', 'referances');
const outputDir = path.join(__dirname, 'public', 'references');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(inputDir, async (err, files) => {
  if (err) {
    console.error('Error reading directory', err);
    return;
  }

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const filenameWithoutExt = path.basename(file, path.extname(file));
    const outputPath = path.join(outputDir, `${filenameWithoutExt}.webp`);

    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Converted ${file} to webp`);
    } catch (error) {
      console.error(`Error converting ${file}`, error);
    }
  }
  
  // Optionally delete the old directory
  fs.rmSync(inputDir, { recursive: true, force: true });
  console.log('Finished conversion and cleaned up old directory.');
});
