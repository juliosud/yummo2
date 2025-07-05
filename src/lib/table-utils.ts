/**
 * Utility functions for table-specific operations and isolation
 */

/**
 * Get the current table number from URL parameters
 */
export const getCurrentTableNumber = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("table") || "1";
};

/**
 * Get the current session code from URL parameters
 */
export const getCurrentSessionCode = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("session");
};

/**
 * Generate a unique session ID for a table
 */
export const generateTableSessionId = (
  tableNumber: string,
  sessionCode?: string,
): string => {
  const timestamp = sessionCode || Date.now().toString();
  return `${tableNumber}-${timestamp}`;
};

/**
 * Check if two table sessions are the same
 */
export const isSameTableSession = (
  sessionId1: string,
  sessionId2: string,
): boolean => {
  return sessionId1 === sessionId2;
};

/**
 * Extract table number from session ID
 */
export const getTableNumberFromSessionId = (sessionId: string): string => {
  return sessionId.split("-")[0] || "1";
};

/**
 * Log table isolation status for debugging
 */
export const logTableIsolationStatus = (
  component: string,
  tableNumber: string,
  sessionId: string,
) => {
  console.log(`🏷️  ${component}: Table isolation status`);
  console.log(`   📍 Table Number: ${tableNumber}`);
  console.log(`   🔑 Session ID: ${sessionId}`);
  console.log(
    `   🔒 Isolated: ${sessionId.includes(tableNumber) ? "YES" : "NO"}`,
  );
};

/**
 * Clean up old table data from localStorage
 */
export const cleanupOldTableData = (
  currentTableNumber: string,
  maxAgeHours: number = 24,
) => {
  const allKeys = Object.keys(localStorage);
  const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
  let cleanedCount = 0;

  allKeys.forEach((key) => {
    if (key.startsWith("cart-") && !key.includes(currentTableNumber)) {
      const timestampKey = key + "-timestamp";
      const timestamp = localStorage.getItem(timestampKey);

      if (timestamp) {
        const keyAge = Date.now() - parseInt(timestamp);
        if (keyAge > maxAge) {
          localStorage.removeItem(key);
          localStorage.removeItem(timestampKey);
          cleanedCount++;
        }
      } else {
        // Remove keys without timestamps (old format)
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }
  });

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} old table data entries`);
  }
};

/**
 * Validate that current session belongs to current table
 */
export const validateTableSession = (
  tableNumber: string,
  sessionId: string,
): boolean => {
  const sessionTableNumber = getTableNumberFromSessionId(sessionId);
  const isValid = sessionTableNumber === tableNumber;

  if (!isValid) {
    console.warn(
      `⚠️  Table session mismatch: URL table=${tableNumber}, Session table=${sessionTableNumber}`,
    );
  }

  return isValid;
};
