// utils/totals.js

function calculateTotals(items, discountRate = 0, gstRate = 0) {
  // Ensure numbers
  discountRate = parseFloat(discountRate) || 0;
  gstRate = parseFloat(gstRate) || 0;

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  const discountAmount = subtotal * (discountRate / 100);
  const afterDiscount = subtotal - discountAmount;

  const gstAmount = afterDiscount * (gstRate / 100);
  const finalPrice = afterDiscount + gstAmount;

  return {
    subtotal,
    discountRate,
    discountAmount,
    gstRate,
    gstAmount,
    finalPrice,
    formatted: {
      subtotal: subtotal.toFixed(2),
      discountRate: discountRate.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      gst: gstAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2)
    }
  };
}
module.exports = { calculateTotals };
