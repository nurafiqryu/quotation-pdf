// template.js
function currency(n) {
  if (typeof n === 'string') return n;         // already formatted
  if (typeof n !== 'number') return '';
  return n.toFixed(2);
}

function computeTotals(q) {
  // If subtotal/gst/final provided, trust them. Otherwise compute.
  const subtotal = q.subtotal != null
    ? parseFloat(q.subtotal)
    : (q.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  const gstRate = (q.gst_rate != null) ? Number(q.gst_rate) : 9; // default 9%
  const gst = (q.gst != null) ? parseFloat(q.gst) : +(subtotal * gstRate / 100).toFixed(2);
  const finalPrice = (q.final_price != null)
    ? parseFloat(q.final_price)
    : +(subtotal + gst).toFixed(2);

  return {
    subtotal,
    gstRate,
    gst,
    finalPrice
  };
}

function buildItemsTable(quotation) {
  const headerRow = [
    { text: 'S/N', style: 'tableHeader' },
    { text: 'Description', style: 'tableHeader' },
    { text: 'Qty', style: 'tableHeader' },
    { text: 'Unit Price (S$)', style: 'tableHeader', alignment: 'right' },
    { text: 'Total (S$)', style: 'tableHeader', alignment: 'right' }
  ];

  const rows = (quotation.items || []).map((it, idx) => ([
    idx + 1,
    { text: it.description || '', noWrap: false },
    it.qty || '',
    { text: currency(Number(it.unit_price)), alignment: 'right' },
    { text: currency(Number(it.total)), alignment: 'right' }
  ]));

  const { subtotal, gstRate, gst, finalPrice } = computeTotals(quotation);

  rows.push(
    [
      { text: 'Total Price', colSpan: 4, alignment: 'right' }, {}, {}, {},
      { text: currency(subtotal), alignment: 'right' }
    ],
    [
      { text: `GST (${gstRate}%)`, colSpan: 4, alignment: 'right' }, {}, {}, {},
      { text: currency(gst), alignment: 'right' }
    ],
    [
      { text: 'Final Price', colSpan: 4, alignment: 'right', bold: true }, {}, {}, {},
      { text: currency(finalPrice), alignment: 'right', bold: true }
    ]
  );

  return {
    table: {
      headerRows: 1,
      widths: ['auto', '*', 'auto', 'auto', 'auto'],
      body: [headerRow, ...rows]
    },
    layout: 'lightHorizontalLines'
  };
}

function buildDocDefinition(data, logoDataUrl) {
  const customer = data.customer || {};
  const quotation = data.quotation || {};
  const terms = data.terms || {};

  return {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],

    content: [
      // Header with logo + title
      {
        columns: [
          (logoDataUrl
            ? { image: 'vigLogo', width: 80 }
            : { text: 'VIG', style: 'title', margin: [0, 10, 0, 0] }),
          {
            text: 'QUOTATION',
            style: 'title',
            alignment: 'right',
            margin: [0, 10, 0, 0]
          }
        ]
      },

      { text: '\n' },

      // Customer & quotation meta
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
            { text: `From: ${quotation.from || ''}`, style: 'value', alignment: 'right' },
            { text: `Pages: ${quotation.pages || '1'}`, style: 'value', alignment: 'right' }
          ]
        ]
      },

      { text: '\n\n' },

      { text: 'We are pleased to submit our quotation as follows:', margin: [0, 0, 0, 10] },

      // Items table
      buildItemsTable(quotation),

      { text: '\n' },

      // Remarks
      { text: 'Remarks:', style: 'subheader' },
      {
        ul: (quotation.remarks && quotation.remarks.length ? quotation.remarks : [
          'Any additional items required other than the above quotation will be charged separately.',
          'Updating of Main/Sub Mimic Zone chart including expansion loop card, if required.',
          'Supply and Install of additional Loop Card, if required.'
        ])
      },

      { text: '\n' },

      // Terms
      {
        text: `Terms: ${terms.payment || ''}\nValidity: ${terms.validity || ''}`,
        style: 'value'
      },

      { text: '\n\n\n' },

      // Footer note
      {
        text: 'This is a computer-generated document. No signature is required.',
        alignment: 'center',
        italics: true,
        fontSize: 9
      },

      { text: '\n' },

      // Company footer (optional)
      {
        text: 'VIG SYSTEMS PTE LTD · No. 1 Sunview Road, ECO-TECH@SUNVIEW, Singapore 627615 · Tel: (65) 68484317/8 · Fax: (65) 68484316',
        alignment: 'center',
        fontSize: 8,
        color: '#444444'
      }
    ],

    images: logoDataUrl ? { vigLogo: logoDataUrl } : {},

    styles: {
      title: { fontSize: 16, bold: true },
      label: { fontSize: 10, bold: true },
      value: { fontSize: 10 },
      tableHeader: { bold: true, fontSize: 10, fillColor: '#eeeeee' },
      subheader: { fontSize: 10, bold: true, margin: [0, 10, 0, 5] }
    },

    defaultStyle: {
      font: 'Roboto' // Change to 'Calibri' after adding Calibri TTFs in server.js
    }
  };
}

module.exports = { buildDocDefinition };
