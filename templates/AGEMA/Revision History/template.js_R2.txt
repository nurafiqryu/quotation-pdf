const fs = require('fs');
const path = require('path');
const { calculateTotals } = require('../../utils/totals');
const styles = require('../../utils/styles');

// Helper to load images as base64
function loadImage(templateDir, filename) {
  try {
    const filePath = path.join(templateDir, filename);
    return fs.readFileSync(filePath).toString('base64');
  } catch (err) {
    console.error(`❌ Error loading image ${filename}:`, err.message);
    return '';
  }
}

// Main export
function generateDocDefinition(data) {
  const { customer, quotation } = data;
  const templateDir = __dirname;

  const totals = calculateTotals(quotation.items, quotation.gst_rate);

  return {
    pageSize: 'A4',
    pageMargins: [40, 100, 40, 100],

    // Images dictionary
    images: {
      logo: 'data:image/png;base64,' + loadImage(templateDir, 'logo.png'),
      smeLogo: 'data:image/png;base64,' + loadImage(templateDir, 'sme500-logo.png'),
      bcaLogo: 'data:image/png;base64,' + loadImage(templateDir, 'bca-logo.png'),
      bizsafeLogo: 'data:image/png;base64,' + loadImage(templateDir, 'bizsafe3-logo.png')
    },

    // Main content (⚠️ keep your original structure)
    content: [
      // Header with company logo + info
      {
        columns: [
          { image: 'logo', fit: [120, 60] },
          {
            stack: [
              { text: customer.name || '', style: 'companyName' },
              { text: customer.address || '', style: 'companyMeta' },
              { text: `Tel: ${customer.contact || ''}`, style: 'companyMeta' }
            ],
            alignment: 'right'
          }
        ]
      },

      { text: '\nQUOTATION', style: 'h1', alignment: 'center' },

      // Customer details
      {
        table: {
          widths: ['auto', '*'],
          body: [
            ['Customer:', customer.name || ''],
            ['Attention:', customer.attention || ''],
            ['Contact:', customer.contact || ''],
            ['Address:', customer.address || '']
          ]
        },
        margin: [0, 20, 0, 20],
        layout: 'noBorders'
      },

      // Quotation items
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Description', style: 'th' },
              { text: 'Qty', style: 'th' },
              { text: 'UOM', style: 'th' },
              { text: 'Unit Price', style: 'th' },
              { text: 'Amount', style: 'th' }
            ],
            ...(quotation.items || []).map((item, idx) => [
              item.description || '',
              item.quantity || '',
              item.unit || '',
              { text: (item.unit_price || 0).toFixed(2), alignment: 'right' },
              { text: (item.total_price || 0).toFixed(2), alignment: 'right' }
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },

      // Totals
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Subtotal', totals.subtotal.toFixed(2)],
            [`GST (${quotation.gst_rate || 9}%)`, totals.gst.toFixed(2)],
            ['Total', totals.total.toFixed(2)]
          ]
        },
        margin: [0, 20, 0, 20],
        layout: 'lightHorizontalLines'
      },

      // Terms & Conditions
      { text: '', pageBreak: 'before' },
      { text: 'Terms & Conditions', style: 'h2', margin: [0, 0, 0, 10] },
      ...(quotation.terms || []).map((t, i) => ({
        text: `${i + 1}. ${t}`,
        style: 'td',
        margin: [0, 0, 0, 5]
      }))
    ],

    styles,
    defaultStyle: { font: 'Roboto', fontSize: 10 },

    // Footer (page numbers on all pages, logos only on last page)
    footer: (currentPage, pageCount) => {
      const pageNum = { 
        text: `Page ${currentPage} of ${pageCount}`, 
        alignment: 'center', 
        fontSize: 9, 
        margin: [0, 0, 0, 8] 
      };

      if (currentPage !== pageCount) return pageNum;

      return {
        stack: [
          pageNum,
          {
            alignment: 'right',
            table: {
              widths: [50, 50, 50],
              body: [[
                { image: 'smeLogo', fit: [50,35], margin: [4,0,4,0] },
                { image: 'bcaLogo', fit: [50,35], margin: [4,0,4,0] },
                { image: 'bizsafeLogo', fit: [50,35], margin: [4,0,0,0] }
              ]]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 10]
          }
        ]
      };
    }
  };
}

module.exports = { generateDocDefinition };
