// templates/AGEMA/template.js

function money(n) {
  if (n === undefined || n === null || isNaN(n)) return '0.00';
  return Number(n).toFixed(2);
}

function computeTotals(items = [], discountRate = 0, gstRate = 9) {
  const subtotal = items.reduce((s, it) => s + (Number(it.total) || 0), 0);
  const discountAmt = subtotal * (Number(discountRate) || 0) / 100;
  const net = subtotal - discountAmt;
  const gstAmt = net * (Number(gstRate) || 0) / 100;
  const grand = net + gstAmt;
  return { subtotal, discountAmt, net, gstAmt, grand };
}

function termsAndConditions(data) {
  // allow override via data.terms, else default
  const txt = (s, bold=false) => ({ text: s, bold });
  const bullet = (s, opt={}) => ({ text: s, margin: [10, 0, 0, 2], ...opt });

  return [
    { text: 'Terms & Conditions:', style: 'h2', margin: [0,0,0,6] },

    // 1. Pricing and Payment
    {
      ol: [
        [
          { text: 'Pricing and Payment:', bold: true },
          bullet('The prices quoted in this sales quotation are valid for a specified period stated in the quote and are subject to change without prior notice.'),
          { text: 'Payment terms are ', margin: [10, 0, 0, 2] },
          { text: '30 Days', bold: true, margin: [10, -12, 0, 0] },
          bullet('from the day of invoice.'),
          bullet('Late payments may be subject to a 5% interest fee or applicable penalties.')
        ],
        // 2. Delivery and Shipping
        [
          { text: 'Delivery and Shipping:', bold: true },
          bullet('Unless explicitly stated, the quoted prices do not include shipping or delivery costs.'),
          { text: 'The estimated delivery time is ', margin: [10, 0, 0, 2] },
          { text: '1 to 2 weeks', bold: true, margin: [10, -12, 0, 0] },
          bullet('from the purchase order received.'),
          bullet('Any delays in delivery beyond the estimated time shall be promptly communicated to the buyer.'),
          bullet('The buyer is responsible for any packaging and handling charges, and additional shipping or transportation costs.')
        ],
        // 3. Returns and Refunds
        [
          { text: 'Returns and Refunds:', bold: true },
          bullet('Returns or exchanges are accepted within [insert return/exchange period] days from delivery subject to these conditions:'),
          bullet('- The product must be in its original condition, unused, and in its original packaging.'),
          bullet('- Proof of purchase required.'),
          bullet('- A restocking fee of 10% of the original invoiced value may apply for returned products.'),
          bullet('- Buyer pays return shipping unless defect/error by seller.'),
          bullet('- Refunds issued within 60 days after inspection.')
        ],
        // 4. Product Warranties
        [
          { text: 'Product Warranties:', bold: true },
          { text: 'The products listed in this sales quotation are covered by a warranty for a period of ', margin: [10,0,0,2] },
          { text: '12 months', bold: true, margin: [10,-12,0,0] },
          bullet('from the date of delivery.'),
          bullet('Covers defects in materials and workmanship under normal use.'),
          bullet('Does not cover misuse, neglect, accidents, or unauthorized repairs.'),
          bullet('To initiate a claim, follow seller’s instructions.')
        ],
        // 5. Limitation of Liability
        [
          { text: 'Limitation of Liability:', bold: true },
          bullet('The seller shall not be liable for any direct, indirect, incidental, or consequential damages arising from the sale or use of the products listed in this sales quotation.'),
          bullet('The seller’s liability is limited to the purchase price of the products.'),
          bullet('This limitation applies to damages, losses, or expenses incurred by the buyer or any third party.')
        ]
      ],
      margin: [0,4,0,0]
    }
  ];
}

function generateDocDefinition(data) {
  const company = data.company || {};
  const cust = data.customer || {};
  const q = data.quotation || {};
  const currency = q.currency || data.quote_currency || 'SGD';
  const gstRate = Number(q.gst_rate ?? data.gst_rate ?? 9);
  const discountRate = Number(q.discount_rate ?? data.discount_rate ?? 0);

  const items = (q.items || []).map((it, idx) => ({
    sno: it.sno ?? idx + 1,
    product: it.product || '',
    description: it.description || '',
    qty: it.qty ?? it.quantity ?? 0,
    uom: it.uom || it.unit || '',
    unit_price: Number(it.unit_price || 0),
    total: Number(it.total || (Number(it.qty || 0) * Number(it.unit_price || 0)))
  }));

  const totals = computeTotals(items, discountRate, gstRate);

  const smallThanks =
    'Thank you for your invitation to quote, we are pleased to submit our proposal for your kind evaluation.';

  const headerColumns = {
    columns: [
      // Logo left
      {
        image: 'logo',
        width: 120
      },
      // Company block right
      {
        stack: [
          { text: company.name || 'AGEMA PTE LTD', style: 'companyName' },
          { text: company.reg_no ? `Reg. No.\n${company.reg_no}` : '', style: 'companyMeta' },
          { text: company.address || '50 Kallang Pudding Rd #07-07\nAMA Building\nSingapore 349326', style: 'companyMeta' },
          { text: company.phone ? `Phone: ${company.phone}` : 'Phone: 6514 2063', style: 'companyMeta' },
          { text: company.website || 'https://www.agema.com.sg', link: company.website || 'https://www.agema.com.sg', color: '#1a73e8', style: 'companyMeta' }
        ],
        alignment: 'right'
      }
    ],
    columnGap: 10,
    margin: [0, 0, 0, 8]
  };

  const partyBlock = {
    columns: [
      {
        width: '60%',
        stack: [
          { text: 'TO:', style: 'label' },
          { text: cust.name || '', style: 'value' },
          { text: `ATTN: ${cust.attention || ''}`, style: 'value' },
          { text: `Contact: ${cust.contact || ''}`, style: 'value' },
          { text: `Address: ${cust.address || ''}`, style: 'value' },
          { text: `Email: ${cust.email || ''}`, style: 'value' }
        ]
      },
      {
        width: '40%',
        stack: [
          { text: 'QUOTATION', style: 'h1', alignment: 'right', margin: [0,0,0,6] },
          { text: `Date: ${q.date || ''}`, style: 'value', alignment: 'right' },
          { text: `Reference: ${q.reference || ''}`, style: 'value', alignment: 'right' },
          { text: `Currency: ${currency}`, style: 'value', alignment: 'right' },
          { text: `Validity: ${q.validity || ''}`, style: 'value', alignment: 'right' },
        ]
      }
    ],
    columnGap: 16,
    margin: [0, 6, 0, 10]
  };

  const itemsTable = {
    table: {
      widths: [60, '*', 40, 50, 70, 80],
      body: [
        [
          { text: 'Product', style: 'th' },
          { text: 'Description', style: 'th' },
          { text: 'Qty', style: 'th', alignment: 'center' },
          { text: 'UOM', style: 'th', alignment: 'center' },
          { text: 'Unit Price', style: 'th', alignment: 'right' },
          { text: 'Amount', style: 'th', alignment: 'right' }
        ],
        ...items.map(it => ([
          { text: it.product || it.sno, style: 'td' },
          { text: it.description, style: 'td' },
          { text: it.qty, style: 'td', alignment: 'center' },
          { text: it.uom, style: 'td', alignment: 'center' },
          { text: money(it.unit_price), style: 'td', alignment: 'right' },
          { text: money(it.total), style: 'td', alignment: 'right' }
        ]))
      ]
    },
    layout: {
      fillColor: (rowIndex) => (rowIndex === 0 ? '#eeeeee' : null),
      hLineColor: '#cccccc',
      vLineColor: '#cccccc'
    },
    margin: [0, 4, 0, 8]
  };

  // Totals grid – discount RATE separate from AMOUNT
  const totalsGrid = {
    table: {
      widths: ['*', 140, 120],
      body: [
        [
          { text: '', border: [false, false, false, false] },
          { text: `Subtotal (${currency})`, alignment: 'right', style: 'totalsRow' },
          { text: money(totals.subtotal), alignment: 'right', style: 'totalsRow' }
        ],
        [
          { text: '', border: [false, false, false, false] },
          { text: `Discount (${discountRate || 0}%)`, alignment: 'right', style: 'totalsRow' },
          { text: money(totals.discountAmt), alignment: 'right', style: 'totalsRow' }
        ],
        [
          { text: '', border: [false, false, false, false] },
          { text: `GST (${gstRate || 0}%) (${currency})`, alignment: 'right', style: 'totalsRow' },
          { text: money(totals.gstAmt), alignment: 'right', style: 'totalsRow' }
        ],
        [
          { text: '', border: [false, false, false, false] },
          { text: `TOTAL (${currency})`, alignment: 'right', bold: true, style: 'totalsRow' },
          { text: money(totals.grand), alignment: 'right', bold: true, style: 'totalsRow' }
        ]
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 6, 0, 0]
  };

  const thankYou = { text: smallThanks, style: 'smallNote', margin: [0, 6, 0, 2] };


  return {
    pageSize: 'A4',
    pageMargins: [30, 40, 30, 60], // footer space for badges

    // footer: badges only on last page; page number always centered
    footer: function (currentPage, pageCount) {
      const pageNum = { text: `Page ${currentPage} of ${pageCount}`, alignment: 'center', fontSize: 9, margin: [0, 0, 0, 8] };

      if (currentPage !== pageCount) return pageNum;

      // last page: right-aligned row, bottoms aligned
      return {
        stack: [
          pageNum,
          {
            columns: [
              { text: '' },
              {
                table: {
                  widths: [50, 50, 50],
                  body: [[
                    { image: 'smeLogo', width: 36, alignment: 'right', margin: [0, 0, 4, 0] },
                    { image: 'bcaLogo', width: 36, alignment: 'right', margin: [0, 0, 4, 0] },
                    { image: 'bizsafeLogo', width: 36, alignment: 'right', margin: [0, 0, 0, 0] }
                  ]]
                },
                layout: 'noBorders',
                alignment: 'right',
                margin: [0, 0, 0, 8]
              }
            ],
            columnGap: 8
          }
        ]
      };
    },

    // Images dictionary is usually injected by server (logo keys)


    content: [
      headerColumns,
      thankYou,
      partyBlock,
      itemsTable,
      totalsGrid,

      // PAGE BREAK → T&C
      { text: '', pageBreak: 'before' },
      ...termsAndConditions(data)
    ],

     images: {
      logo: 'data:image/png;base64,' + loadImage(templateDir, 'logo.png'),
      bcaLogo: 'data:image/png;base64,' + loadImage(templateDir, 'bca-logo.png'),
      bizsafeLogo: 'data:image/png;base64,' + loadImage(templateDir, 'bizsafe3-logo.png'),
      smeLogo: 'data:image/png;base64,' + loadImage(templateDir, 'sme500-logo.png')
    },

    styles: {
      companyName: { fontSize: 12, bold: true },
      companyMeta: { fontSize: 9, lineHeight: 1.15 },
      h1: { fontSize: 14, bold: true },
      h2: { fontSize: 12, bold: true },
      label: { bold: true, fontSize: 10, margin: [0, 2, 0, 0] },
      value: { fontSize: 10, margin: [0, 0, 0, 1] },
      th: { bold: true, fontSize: 10 },
      td: { fontSize: 10 },
      totalsRow: { fontSize: 10 },
      smallNote: { fontSize: 9, color: '#333' }
    },

    defaultStyle: { fontSize: 10 }
  };
}

module.exports = { generateDocDefinition };
