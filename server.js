const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Fonts (shared across all templates)
const fonts = {
  Roboto: {
    normal: path.join(__dirname, 'fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, 'fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, 'fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, 'fonts/Roboto-MediumItalic.ttf')
  }
};
const printer = new PdfPrinter(fonts);

// Serve generated PDFs (for /public links)
app.use('/public', express.static(path.join(__dirname, 'public')));

// ✅ Health check endpoint (for uptime pings)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Helper to load templates safely
function loadTemplate(templateName) {
  const safeName = (templateName || 'default').toLowerCase();
  const templatePath = path.join(__dirname, 'templates', safeName, 'template.js');

  console.log('🔍 Looking for template at:', templatePath);

  if (fs.existsSync(templatePath)) {
    // ✅ Clear require cache so changes take effect instantly
    delete require.cache[require.resolve(templatePath)];
    return require(templatePath);
  } else {
    console.warn(⚠️ Template "${safeName}" not found, falling back to default.`);
    const defaultPath = path.join(__dirname, 'templates', 'default', 'template.js');
    delete require.cache[require.resolve(defaultPath)];
    return require(defaultPath);
  }
}

// ✅ Generate PDF and return it directly
app.post('/generate-quotation', async (req, res) => {
  try {
    const template = loadTemplate(req.body.template);
    const docDefinition = template.build(req.body);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ✅ Generate PDF, save file, and return a link
app.post('/generate-quotation-link', async (req, res) => {
  try {
    const template = loadTemplate(req.body.template);
    const docDefinition = template.build(req.body);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Sanitize filename so it won't break with slashes/spaces/etc.
    const rawRef = req.body.quotation?.ref_no || Date.now().toString();
    const safeRef = rawRef.replace(/[^a-zA-Z0-9-_]/g, '_'); // allow only letters, numbers, - and _
    const filename = `Quotation-${safeRef}.pdf`;

    const filePath = path.join(__dirname, 'public', filename);

    const stream = fs.createWriteStream(filePath);
    pdfDoc.pipe(stream);
    pdfDoc.end();

    stream.on('finish', () => {
      const url = `${req.protocol}://${req.get('host')}/public/${filename}`;
      res.json({ url });
    });

  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 PDF server running on http://localhost:${PORT}`);
});
