// utils/totals.js

function computeTotals(items, discountRate = 0, gstRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);

  const discountAmount = (discountRate > 0) ? subtotal * (discountRate / 100) : 0;
  const afterDiscount = subtotal - discountAmount;

  const gstAmount = (gstRate > 0) ? afterDiscount * (gstRate / 100) : 0;
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
