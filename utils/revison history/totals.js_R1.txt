// utils/totals.js

function calculateTotals(items = [], gstRate = 0, discountRate = 0) {
  // Sum all item totals
  const subtotal = items.reduce((acc, item) => acc + (item.total_price || 0), 0);

  // Apply discount
  const discountAmount = (subtotal * (discountRate || 0)) / 100;
  const discountedSubtotal = subtotal - discountAmount;

  // Apply GST
  const gst = (discountedSubtotal * (gstRate || 0)) / 100;
  const finalPrice = discountedSubtotal + gst;

  return {
    raw: {
      subtotal,
      discountAmount,
      discountedSubtotal,
      gst,
      finalPrice
    },
    formatted: {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      gst: gst.toFixed(2),
      finalPrice: finalPrice.toFixed(2)
    }
  };
}

module.exports = { calculateTotals };
