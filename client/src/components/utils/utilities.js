/**
 * Utility functions for the Newark-IT application
 */

/**
 * Safely formats a price value to a string with 2 decimal places
 * Handles various input types including numbers, strings, null, and undefined
 * 
 * @param {*} price - The price value to format
 * @returns {string} - Formatted price with 2 decimal places
 */
export const formatPrice = (price) => {
    // Handle null/undefined
    if (price == null) return '0.00';
    
    // Handle numbers and number strings
    const num = Number(price);
    if (!isNaN(num)) {
      return num.toFixed(2);
    }
    
    // Handle cases where we can't convert to a number
    return '0.00';
  };
  
  /**
   * Format a date string to a more readable format
   * 
   * @param {string} dateString - The date string to format
   * @returns {string} - Formatted date string
   */
  export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };