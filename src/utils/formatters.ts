
/**
 * Formats a number with commas for thousands separators
 * @param value - The number to format
 * @returns The formatted string with commas
 */
export const formatNumberWithCommas = (value: number | string): string => {
  // Convert to string and remove non-digit characters except decimal point
  const numStr = value.toString().replace(/[^\d.]/g, '');
  
  // Split by decimal point
  const parts = numStr.split('.');
  
  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Join back with decimal part if it exists
  return parts.join('.');
};

/**
 * Parses a string with commas into a number
 * @param value - The formatted string to parse
 * @returns The parsed number
 */
export const parseFormattedNumber = (value: string): number => {
  // Remove all non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  return parseFloat(cleanValue) || 0;
};
