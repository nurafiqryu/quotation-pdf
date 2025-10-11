const path = require('path');
const { calculateTotals } = require('../../utils/totals');
const { loadImage } = require('../../utils/imageLoader');

function generateDocDefinition(data) {
  const { client, customer, quotation } = data;
  const templateDir = __dirname;

  const totals = calculateTotals(
    quotation.items || [],
    quotation.discount_rate,
    quotation.gst_rate
  );

  return {
    content: [
      // Header
      {
        columns: [
          { image: 'logo', width: 100 },
          {
            stack: [
              { text: client.name || '', style: 'title', alignment: 'right' },
              { text: client.address1 || '', style: 'value', alignment: 'right' },
              { text: client.address2 || '', style: 'value', alignment: 'right' },
              { text: `Phone: ${client.phone || ''}`, style: 'value', alignment: 'right' },
              { text: client.email || '', style: 'value', alignment: 'right' }
            ]
          }
        ]
      },

      '\n',
      { text: quotation.subject || '', style: 'subheader' },

      '\n',
      {
        columns: [
          [
            { text: `Customer: ${customer.name || ''}`, style: 'value' },
            { text: `ATTN: ${customer.attention || ''}`, style: 'value' },
            { text: `Phone: ${customer.phone || ''}`, style: 'value' },
            { text: `Email: ${customer.email || ''}`, style: 'value' }
          ],
          [
            { text: `Quotation Ref: ${quotation.ref_no || ''}`, style: 'refNo', alignment: 'right' },
            { text: `Date: ${quotation.date || ''}`, style: 'value', alignment: 'right' },
            { text: `Terms: ${quotation.terms || ''}`, style: 'value', alignment: 'right' },
            { text: `Validity: ${quotation.validity || ''}`, style: 'value', alignment: 'right' }
          ]
        ]
      },

      '\n',
      { text: 'As requested, we are pleased to submit our quotation as follows:', fontSize: 9, margin: [0, 0, 0, 10] },

      // Items table
      {
        table: {
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'S/N', style: 'tableHeader' },
              { text: 'Item ID', style: 'tableHeader' },
              { text: 'Description', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader' },
              { text: 'UOM', style: 'tableHeader' },
              { text: 'Amount (S$)', style: 'tableHeader' }
            ],
            ...(quotation.items || []).map((item, i) => [
              i + 1,
              item.item_id || '',
              item.description || '',
              item.qty || '',
              item.uom || '',
              ((item.qty || 0) * (item.unit_price || 0)).toFixed(2)
            ])
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#000',
          vLineColor: () => '#000'
        }
      },

      '\n',
      // Totals block
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [{ text: 'Subtotal (SGD)', alignment: 'right' }, { text: totals.formatted.subtotal, alignment: 'right' }],
            [{ text: `Discount (${totals.discountRate || 0}%)`, alignment: 'right' }, { text: totals.formatted.discountAmount, alignment: 'right' }],
            [{ text: `GST (${quotation.gst_rate || 0}%)`, alignment: 'right' }, { text: totals.formatted.gst, alignment: 'right' }],
            [{ text: 'TOTAL (SGD)', alignment: 'right', bold: true }, { text: totals.formatted.finalPrice, alignment: 'right', bold: true }]
          ]
        },
        layout: 'noBorders',
        margin: [0, 10, 0, 0]
      },

      '\n',
      { text: 'Any additional items other than the above will be charged separately.', fontSize: 9, italics: true }
    ],

    styles: {
      title: { fontSize: 12, bold: true },
      subheader: { fontSize: 11, bold: true },
      value: { fontSize: 9 },
      tableHeader: { bold: true, fontSize: 9 },
      refNo: { bold: true, fontSize: 11 }
    },

    images: {
      logo: 'data:image/png;base64,' + loadImage(templateDir, 'logo.png')
    },

    defaultStyle: { font: 'Roboto' },

    footer: (currentPage, pageCount) => {
      return {
        columns: [
          { text: `Page ${currentPage} of ${pageCount}`, alignment: 'left', fontSize: 8, margin: [20, 0, 0, 0] },
          { text: 'Quotation produced by Lyt Brox Pte Ltd software.', alignment: 'right', fontSize: 8, italics: true, margin: [0, 0, 20, 0] }
        ]
      };
    }
  };
}

module.exports = { generateDocDefinition };
