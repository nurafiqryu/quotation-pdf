// utils/totals.js
const { formatCurrency } = require('./pdfHelpers');

function calculateTotals(items, gstRate) {
  const subtotal = (items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  const gst = +(subtotal * (gstRate || 0) / 100).toFixed(2);
  const finalPrice = +(subtotal + gst).toFixed(2);

  return {
    subtotal,
    gst,
    finalPrice,
    formatted: {
      subtotal: formatCurrency(subtotal),
      gst: formatCurrency(gst),
      finalPrice: formatCurrency(finalPrice)
    }
  };
}

module.exports = { calculateTotals };
