/**
 * Utility functions for search and filter operations
 */

/**
 * Filters items by search text with prioritization
 * Items that start with search text appear first,
 * followed by items that contain the search text
 *
 * @param {Array} items - Array of items to search
 * @param {string} searchText - Search query
 * @param {string} searchKey - Object key to search in (e.g., 'node_name', 'id')
 * @returns {Array} Filtered and sorted items
 */
export function filterBySearch(items, searchText, searchKey) {
  if (!searchText || searchText.length === 0) {
    return items;
  }

  const lowerSearch = searchText.toLowerCase();

  const startsWith = items.filter((item) =>
    item[searchKey].toLowerCase().startsWith(lowerSearch)
  );

  const includes = items.filter((item) => {
    const lowerValue = item[searchKey].toLowerCase();
    return (
      lowerValue.includes(lowerSearch) && !lowerValue.startsWith(lowerSearch)
    );
  });

  return [...startsWith, ...includes];
}

/**
 * Extracts unique values from array of objects by key
 *
 * @param {Array} items - Array of objects
 * @param {string} key - Key to extract unique values from
 * @returns {Array} Array of unique values
 */
export function getUniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]))];
}
