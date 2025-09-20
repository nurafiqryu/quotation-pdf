// utils/imageLoader.js
const fs = require('fs');
const path = require('path');

function loadImage(templateDir, filename) {
  const filePath = path.join(templateDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Missing image: ${filePath}`);
    return null;
  }
  return fs.readFileSync(filePath).toString('base64');
}

function imagePath(templateDir, filename) {
  // Alternative: let pdfmake read the file path directly
  return path.join(templateDir, filename);
}

module.exports = { loadImage, imagePath };
