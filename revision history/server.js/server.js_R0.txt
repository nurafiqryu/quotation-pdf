// server.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const PdfPrinter = require('pdfmake');
const { buildDocDefinition } = require('./template');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---- Fonts mapping (Roboto for quick start)
const fonts = {
  Roboto: {
    normal: path.join(__dirname, 'fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, 'fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, 'fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, 'fonts/Roboto-MediumItalic.ttf')
  }
  // To switch to Calibri later, add:
  // Calibri: {
  //   normal: path.join(__dirname, 'fonts/Calibri.ttf'),
  //   bold: path.join(__dirname, 'fonts/Calibri-Bold.ttf'),
  //   italics: path.join(__dirname, 'fonts/Calibri-Italic.ttf'),
  //   bolditalics: path.join(__dirname, 'fonts/Calibri-BoldItalic.ttf')
  // }
};

const printer = new PdfPrinter(fonts);

// Load logo as base64 Data URL (once at boot)
const logoPath = path.join(__dirname, 'assets', 'vig-logo.png');
const logoDataUrl = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : null;

// Helper: safe filename
function safeFile(s) {
  return String(s || 'Quotation').replace(/[^a-z0-9_\-]+/gi, '_');
}

// 1) Return PDF directly (binary stream) — great for preview
app.post('/generate-quotation', (req, res) => {
  try {
    const data = req.body || {};
    const dd = buildDocDefinition(data, logoDataUrl);

    const pdfDoc = printer.createPdfKitDocument(dd);
    const filename = `Quotation-${safeFile(data?.quotation?.ref_no)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    pdfDoc.on('error', (err) => {
      console.error(err);
      res.status(500).end('PDF generation error');
    });

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// 2) Save + return sharable link (for Telegram/WhatsApp)
app.post('/generate-quotation-link', (req, res) => {
  try {
    const data = req.body || {};
    const dd = buildDocDefinition(data, logoDataUrl);

    const filename = `Quotation-${safeFile(data?.quotation?.ref_no)}-${Date.now()}.pdf`;
    const outPath = path.join(__dirname, 'public', filename);
    const pdfDoc = printer.createPdfKitDocument(dd);

    const stream = fs.createWriteStream(outPath);
    pdfDoc.pipe(stream);
    pdfDoc.end();

    stream.on('finish', () => {
      const url = `${req.protocol}://${req.get('host')}/public/${filename}`;
      res.json({ url });
    });
    stream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'Failed to save PDF' });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`PDF server running on http://localhost:${PORT}`);
});

