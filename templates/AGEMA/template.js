const path = require('path');
const { calculateTotals } = require('../../utils/totals');
const styles = require('../../utils/styles');
const { loadImage } = require('../../utils/imageLoader');

function generateDocDefinition(data) {
  const { customer, quotation } = data;
  const templateDir = __dirname;

  const totals = calculateTotals(
    quotation.items || [],
    quotation.gst_rate,
    quotation.discount_rate
  );

  // ✅ Constant Terms & Conditions
  const defaultTerms = [
    [
      { text: 'Pricing and Payment:\n', bold: true },
      'The prices quoted in this sales quotation are valid for a specified period stated in the quote and are subject to change without prior notice.\n',
      'Payment terms are ', { text: '30 Days', bold: true }, ' from the day of invoice.\n',
      'Late payments may be subject to a 5% interest fee or applicable penalties.'
    ],
    [
      { text: 'Delivery and Shipping:\n', bold: true },
      'Unless explicitly stated, the quoted prices do not include shipping or delivery costs.\n',
      'The estimated delivery time is ', { text: '1 to 2 weeks', bold: true }, ' from the purchase order received.\n',
      'Any delays in delivery beyond the estimated time shall be promptly communicated to the buyer.\n',
      'The buyer is responsible for any packaging, handling, and transportation costs.'
    ],
    [
      { text: 'Returns and Refunds:\n', bold: true },
      'Returns or exchanges are accepted within [insert return/exchange period] days from delivery subject to these conditions:\n',
      '- The product must be in its original condition, unused, and in its original packaging.\n',
      '- Proof of purchase required.\n',
      '- Restocking fee of 10% may apply.\n',
      '- Buyer pays return shipping unless defect/error by seller.\n',
      'Refunds issued within 60 days after inspection.'
    ],
    [
      { text: 'Product Warranties:\n', bold: true },
      'The products listed are covered by a warranty for ', { text: '12 months', bold: true }, ' from the date of delivery.\n',
      'Covers defects in materials/workmanship under normal use.\n',
      'Does not cover misuse, neglect, accidents, or unauthorized repairs.\n',
      'Warranty claims must follow seller’s instructions.'
    ],
    [
      { text: 'Limitation of Liability:\n', bold: true },
      'The seller is not liable for any direct, indirect, incidental, or consequential damages.\n',
      'Liability limited to purchase price of products.\n',
      'This applies to damages, losses, or expenses incurred by the buyer or third parties.'
    ]
  ];

  return {
    content: [
      // Header
      {
        columns: [
          { image: 'logo', width: 100 },
          {
            stack: [
              { text: 'AGEMA PTE LTD', style: 'title', alignment: 'right' },
              { text: 'Reg. No.', style: 'value', alignment: 'right' },
              { text: '50 Kallang Pudding Rd #07-07\nAMA Building\nSingapore 349326', style: 'value', alignment: 'right' },
              { text: 'Phone: 6514 2063', style: 'value', alignment: 'right' },
              { text: 'https://www.agema.com.sg', style: 'value', color: 'blue', link: 'https://www.agema.com.sg', alignment: 'right' }
            ]
          }
        ]
      },

      '\n',
      {
        columns: [
          [
            { text: `${quotation.ref_no || ''}`, style: 'refNo' },
            { text: `TO: ${customer.name || ''}`, style: 'value' },
            { text: `ATTN: ${customer.attention || ''}`, style: 'value' },
            { text: `Contact: ${customer.contact || ''}`, style: 'value' },
            { text: `Address: ${customer.address || ''}`, style: 'value' }
          ],
          [
            { text: 'QUOTATION', style: 'quotationHeader', alignment: 'right' },
            { text: `Date: ${quotation.date || ''}`, style: 'value', alignment: 'right' },
            { text: `Reference: ${quotation.reference || ''}`, style: 'value', alignment: 'right' },
            { text: `Currency: ${quotation.currency || 'SGD'}`, style: 'value', alignment: 'right' },
            { text: `Validity: ${quotation.validity || ''}`, style: 'value', alignment: 'right' },
            // Pages will be inserted later by footer using pageCount
            { text: 'Pages: (see footer)', style: 'value', alignment: 'right' }
          ]
        ]
      },

      '\n',
      { text: `Subject: ${quotation.subject || ''}`, style: 'subheader' },
      { text: `Location: ${quotation.location || ''}`, style: 'value' },
      '\n',

      { text: 'Thank you for your invitation to quote, we are pleased to submit our proposal for your kind evaluation.', fontSize: 9, margin: [0, 0, 0, 10] },

// Items Table
{
  table: {
    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
    body: [
      [
        { text: 'Product', style: 'tableHeader' },
        { text: 'Description', style: 'tableHeader' },
        { text: 'Qty', style: 'tableHeader' },
        { text: 'UOM', style: 'tableHeader' },
        { text: 'Unit Price (S$)', style: 'tableHeader' },
        { text: 'Amount (S$)', style: 'tableHeader' }
      ],
      ...(quotation.items || []).map((item) => [
        item.product || '',
        item.description || '',
        item.qty || '',
        item.uom || '',
        (item.unit_price || 0).toFixed(2),
        (item.total_price || item.total || 0).toFixed(2)
      ])
    ]
  },
  layout: {
  hLineWidth: function () { return 0.5; },
  vLineWidth: function () { return 0.5; },
  hLineColor: function () { return '#000'; },
  vLineColor: function () { return '#000'; }
  },
pageBreak: null,

},

// Totals Section (outside the table)
{
  table: {
    widths: ['*', 'auto'],
    body: [
      [
        { text: 'Subtotal (SGD)', alignment: 'right', bold: true, fontSize: 11 },
        { text: totals.formatted.subtotal, alignment: 'right', fontSize: 11 }
      ],
	[
  	{ 
  	  text: `Discount (${totals.discountRate || 0}%)`, 
  	  alignment: 'right', 
  	  fontSize: 11 
	  },
	  { 
 	   text: totals.formatted.discountAmount, 
 	   alignment: 'right', 
 	   fontSize: 11 
 	 }
	],

      [
        { text: `GST (${quotation.gst_rate || 0}%) (SGD)`, alignment: 'right', fontSize: 11 },
        { text: totals.formatted.gst, alignment: 'right', fontSize: 11 }
      ],
      [
        { text: 'TOTAL (SGD)', alignment: 'right', bold: true, fontSize: 12 },
        { text: totals.formatted.finalPrice, alignment: 'right', bold: true, fontSize: 12 }
      ]
    ]
  },
  layout: 'noBorders',
  margin: [0, 10, 0, 0]
},

'\n',
// Header
{
  columns: [
    { image: 'logo', width: 100 },
    {
      stack: [
        { text: 'AGEMA PTE LTD', style: 'title', alignment: 'right' },
        { text: 'Reg. No.', style: 'value', alignment: 'right' },
        { text: '50 Kallang Pudding Rd #07-07\nAMA Building\nSingapore 349326', style: 'value', alignment: 'right' },
        { text: 'Phone: 6514 2063', style: 'value', alignment: 'right' },
        { text: 'https://www.agema.com.sg', style: 'value', color: 'blue', link: 'https://www.agema.com.sg', alignment: 'right' }
      ],
      alignment: 'right'   // applies to whole stack
    }
  ],
  pageBreak: 'before'     // ✅ this applies to the *whole columns block*
},


      '\n',
      {
        columns: [
          [
            { text: `${quotation.ref_no || ''}`, style: 'refNo' },
            { text: `TO: ${customer.name || ''}`, style: 'value' },
            { text: `ATTN: ${customer.attention || ''}`, style: 'value' },
            { text: `Contact: ${customer.contact || ''}`, style: 'value' },
            { text: `Address: ${customer.address || ''}`, style: 'value' }
          ],
          [
            { text: 'QUOTATION', style: 'quotationHeader', alignment: 'right' },
            { text: `Date: ${quotation.date || ''}`, style: 'value', alignment: 'right' },
            { text: `Reference: ${quotation.reference || ''}`, style: 'value', alignment: 'right' },
            { text: `Currency: ${quotation.currency || 'SGD'}`, style: 'value', alignment: 'right' },
            { text: `Validity: ${quotation.validity || ''}`, style: 'value', alignment: 'right' },
            // Pages will be inserted later by footer using pageCount
            { text: 'Pages: (see footer)', style: 'value', alignment: 'right' }
          ]
        ]
      },

      '\n',
      { text: `Subject: ${quotation.subject || ''}`, style: 'subheader' },
      { text: `Location: ${quotation.location || ''}`, style: 'value' },
      '\n',

      { text: 'Thank you for your invitation to quote, we are pleased to submit our proposal for your kind evaluation.', fontSize: 9, margin: [0, 0, 0, 10] },


      // Terms & Conditions
      {
        text: 'Terms & Conditions:',
        style: 'subheader',
      },
      { ol: defaultTerms, fontSize: 9 }
    ],

    styles: {
      ...styles,
      refNo: { fontSize: 12, bold: true },
      quotationHeader: { fontSize: 12, bold: true }
    },

    images: {
      logo: 'data:image/png;base64,' + loadImage(templateDir, 'logo.png'),
      bcaLogo: 'data:image/png;base64,' + loadImage(templateDir, 'bca-logo.png'),
      bizsafeLogo: 'data:image/png;base64,' + loadImage(templateDir, 'bizsafe3-logo.png'),
      smeLogo: 'data:image/png;base64,' + loadImage(templateDir, 'sme500-logo.png')
    },

    defaultStyle: { font: 'Roboto' },

    footer: (currentPage, pageCount) => {
      if (currentPage === pageCount) {
        return {
          columns: [
            {
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: 'left',
              fontSize: 9,
              margin: [20, 0, 0, 0]
            },
            {
              columns: [
                { image: 'smeLogo', fit: [50, 35], margin: [5, 0, 0, 0] },
                { image: 'bcaLogo', fit: [50, 35], margin: [5, 0, 0, 0] },
                { image: 'bizsafeLogo', fit: [50, 35], margin: [5, 0, 0, 0] }
              ],
              alignment: 'right',
              width: 'auto'
            }
          ],
          margin: [20, 0, 20, 15]
        };
      }

      return {
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 9,
        margin: [0, 10, 0, 0]
      };
    }
  };
}

module.exports = { generateDocDefinition };
