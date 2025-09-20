const path = require('path');
const { calculateTotals } = require('../../utils/totals');
const { disclaimer, vigCustomerConfirm } = require('../../utils/constants');
const styles = require('../../utils/styles');
const { loadImage } = require('../../utils/imageLoader');

module.exports.build = (data) => {
  const { customer, quotation, terms } = data;
  const templateDir = __dirname;

  const totals = calculateTotals(quotation.items, quotation.gst_rate);

  return {
    content: [
      {
        columns: [
          { image: 'logo', width: 100 },
          { text: 'QUOTATION', style: 'title', alignment: 'right', margin: [0, 20, 0, 0] }
        ]
      },
      '\n',
      {
        columns: [
          [
            { text: 'Customer:', style: 'label' },
            { text: customer.name || '', style: 'value' },
            { text: customer.address || '', style: 'value' },
            { text: `Attention: ${customer.attention || ''}`, style: 'value' },
            { text: `Email: ${customer.email || ''}`, style: 'value' }
          ],
          [
            { text: `Quotation Ref. No.: ${quotation.ref_no || ''}`, style: 'value', alignment: 'right' },
            { text: `Date: ${quotation.date || ''}`, style: 'value', alignment: 'right' },
            { text: `From: ${quotation.from || ''}`, style: 'value', alignment: 'right' }
          ]
        ]
      },
      '\n\n',
      { text: 'With reference to your enquiry, we are pleased to submit our quotation as follows:', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'S/N', style: 'tableHeader' },
              { text: 'Description', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader' },
              { text: 'Unit Price (S$)', style: 'tableHeader' },
              { text: 'Total (S$)', style: 'tableHeader' }
            ],
            ...(quotation.items || []).map((item, index) => [
              index + 1,
              item.description || '',
              item.qty || '',
              (item.unit_price || 0).toFixed(2),
              (item.total || 0).toFixed(2)
            ]),
            [
              { text: 'Total Price', colSpan: 4, alignment: 'right' }, {}, {}, {},
              totals.formatted.subtotal
            ],
            [
              { text: `GST (${quotation.gst_rate || 0}%)`, colSpan: 4, alignment: 'right' }, {}, {}, {},
              totals.formatted.gst
            ],
            [
              { text: 'Final Price', colSpan: 4, alignment: 'right', bold: true }, {}, {}, {},
              totals.formatted.finalPrice
            ]
          ]
        }
      },
      '\n',
      { text: 'Remarks:', style: 'subheader' },
      { ul: quotation.remarks || [] },
      '\n',
      { text: `Terms: ${terms.payment}\nValidity: ${terms.validity}`, style: 'value' },
      '\n\n',
      { text: 'We hope that the above is to your satisfaction and please kindly endorse below to confirm this order.', margin: [0, 10, 0, 10] },
      { text: 'Yours Faithfully,\n\nVIG SYSTEMS PTE LTD\n', style: 'value' },
      {
        columns: [
          [
            { text: '_____________________________', margin: [0, 20, 0, 0] },
            { text: 'Nur Afiq Bin Norhaizat', style: 'value' },
            { text: 'Project Engineer', style: 'value' }
          ],
          [
            { text: '_____________________________', margin: [0, 20, 0, 0] },
            { text: vigCustomerConfirm, style: 'value' }
          ]
        ]
      },
      '\n\n',
      { text: disclaimer, style: 'disclaimer' }
    ],

    styles,

    images: {
      logo: 'data:image/png;base64,' + loadImage(templateDir, 'logo.png')
    },

    defaultStyle: { font: 'Roboto' },

    footer: (currentPage, pageCount) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'center',
      fontSize: 9,
      margin: [0, 10, 0, 0]
    })
  };
};
