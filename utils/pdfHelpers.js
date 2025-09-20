// utils/pdfHelpers.js
module.exports = {
  // Format numbers into 2 decimal places
  formatCurrency(num) {
    return Number(num || 0).toFixed(2);
  },

  // Format into Singapore-style date (DD MMM YYYY)
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  // Safe text (fallback to empty string)
  safeText(str) {
    return str || '';
  }
};
