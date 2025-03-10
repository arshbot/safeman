
/**
 * Formats a number with commas for thousands separators and optional specified decimals
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns The formatted string with commas
 */
export const formatNumberWithCommas = (value: number | string, decimals = 2): string => {
  // Convert to number first
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  // Handle NaN or undefined
  if (isNaN(num) || num === undefined) return '0';
  
  // For numbers less than 1, show specific decimal precision
  if (Math.abs(num) < 1 && Math.abs(num) > 0) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Format the number with commas for thousands
  const parts = num.toFixed(decimals).split('.');
  
  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // If decimal part is all zeros, return just the integer part
  if (parts.length > 1 && !parseInt(parts[1])) {
    return parts[0];
  }
  
  // Join back with decimal part if it exists
  return parts.join('.');
};

/**
 * Formats a currency value with '$' prefix and 'k' suffix for thousands, 'M' suffix for millions
 * @param value - The number to format
 * @returns The formatted currency string
 */
export const formatCurrency = (value: number): string => {
  // For values less than 1 million but greater than or equal to 1000
  if (value >= 1000 && value < 1000000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  // For values less than 1000 but greater than 0
  else if (value < 1000 && value > 0) {
    return `$${value.toFixed(0)}`;
  }
  // For values greater than or equal to 1 million
  else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  // Default case for zero or negative values
  return `$0`;
};

/**
 * Formats a percentage value with '%' suffix
 * @param value - The percentage value
 * @returns The formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  // Changed to display 2 decimal places for percentages
  return `${formatNumberWithCommas(value, 2)}%`;
};

/**
 * Parses a string with commas into a number
 * @param value - The formatted string to parse
 * @returns The parsed number
 */
export const parseFormattedNumber = (value: string): number => {
  // Remove all non-digit characters except decimal point and minus sign
  const cleanValue = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleanValue) || 0;
};

/**
 * Parses an Excel value that might be a number or formatted string
 * @param value - The Excel value to parse
 * @returns The parsed number or 0 if invalid
 */
export const parseExcelValue = (value: any): number => {
  if (typeof value === 'number') {
    return value;
  } else if (typeof value === 'string') {
    // Remove currency symbols, commas, etc. and parse
    const cleanedValue = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleanedValue) || 0;
  }
  return 0;
};
