const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfmake');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// ✅ Helper to load templates safely (case sensitive)
function loadTemplate(templateName) {
  const safeName = templateName || 'default';
  const templatePath = path.join(__dirname, 'templates', safeName, 'template.js');

  console.log('🔍 Looking for template at:', templatePath);

  if (fs.existsSync(templatePath)) {
    // ✅ Clear require cache so changes take effect instantly
    delete require.cache[require.resolve(templatePath)];
    return require(templatePath);
  } else {
    console.warn(`⚠️ Template "${safeName}" not found, falling back to default.`);
    const defaultPath = path.join(__dirname, 'templates', 'default', 'template.js');
    delete require.cache[require.resolve(defaultPath)];
    return require(defaultPath);
  }
}

// ✅ Route to generate quotation PDFs
app.post('/generate-quotation', async (req, res) => {
  try {
    const { template, ...data } = req.body;
    const templateModule = loadTemplate(template);
    const docDefinition = await templateModule.generateDocDefinition(data);

    const printer = new PDFDocument({
      Roboto: {
        normal: path.join(__dirname, 'static', 'fonts', 'Roboto-Regular.ttf'),
        bold: path.join(__dirname, 'static', 'fonts', 'Roboto-Medium.ttf'),
        italics: path.join(__dirname, 'static', 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, 'static', 'fonts', 'Roboto-MediumItalic.ttf')
      }
    });

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    const outputDir = path.join(__dirname, 'public');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const fileName = `Quotation-${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    writeStream.on('finish', () => {
      const fileUrl = `${req.protocol}://${req.get('host')}/public/${fileName}`;
      res.json({ success: true, file: fileUrl });
    });

    writeStream.on('error', (err) => {
      console.error('❌ WriteStream error:', err);
      res.status(500).json({ success: false, message: 'Error saving PDF' });
    });

  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ✅ Static hosting for generated files
app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
