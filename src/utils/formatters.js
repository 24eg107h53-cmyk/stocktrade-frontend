// Format numbers as Indian Rupee or standard currency
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  const val = Number(amount);
  return '₹' + val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format percentages with +/- signs
export const formatPercentage = (percent) => {
  if (percent === null || percent === undefined || isNaN(percent)) return '0.00%';
  const val = Number(percent);
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
};

// Format dates
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};

// Format time only
export const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e) {
    return '';
  }
};
