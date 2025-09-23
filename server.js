const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');

const app = express();
app.use(bodyParser.json());

// ✅ Font setup – points to /quotation-pdf/fonts/
const fonts = {
  Roboto: {
    normal: path.join(__dirname, 'fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, 'fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, 'fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, 'fonts/Roboto-MediumItalic.ttf')
  }
};

const printer = new PdfPrinter(fonts);

// (optional) serve generated PDFs or assets via HTTP
// e.g. http://localhost:3000/public/Quotation-123.pdf
app.use('/public', express.static(path.join(__dirname, 'public')));

// ===============================
// API ENDPOINT TO GENERATE PDF
// ===============================
app.post('/generate-quotation', async (req, res) => {
  try {
    const { template, data } = req.body;
    const templateModule = require(`./templates/${template}/template.js`);

    if (typeof templateModule.generateDocDefinition !== 'function') {
      return res.status(500).json({
        success: false,
        message: `Template ${template} is missing generateDocDefinition()`
      });
    }

    const docDefinition = await templateModule.generateDocDefinition(data);

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const outputDir = path.join(__dirname, 'public');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filename = `Quotation-${template}-${Date.now()}.pdf`;
    const filePath = path.join(outputDir, filename);

    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    writeStream.on('finish', () => {
      res.json({
        success: true,
        file: `/public/${filename}`,
        fullPath: filePath
      });
    });

    writeStream.on('error', err => {
      console.error('❌ WriteStream error:', err);
      res.status(500).json({ success: false, message: 'Failed to save PDF' });
    });
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// HEALTH CHECK ENDPOINT
// ===============================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
