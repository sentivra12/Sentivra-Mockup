import { useState, useEffect, useRef } from 'react';

/**
 * Deep equality check without lodash
 */
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

/**
 * useFormDirty - Track if form data has changed from initial values
 * 
 * Uses deep comparison to detect changes reliably
 * Resets only after explicit save or discard
 * 
 * @param {Object} currentData - Current form data
 * @param {Object} initialData - Initial/saved data (from database)
 * @returns {Object} - { isDirty, markClean, resetToInitial }
 */
export function useFormDirty(currentData, initialData) {
  const [isDirty, setIsDirty] = useState(false);
  const savedSnapshotRef = useRef(null);

  // Initialize snapshot when initial data loads
  useEffect(() => {
    if (initialData && !savedSnapshotRef.current) {
      savedSnapshotRef.current = JSON.parse(JSON.stringify(initialData));
    }
  }, [initialData]);

  // Check if current data differs from saved snapshot
  useEffect(() => {
    if (!savedSnapshotRef.current || !currentData) {
      setIsDirty(false);
      return;
    }

    // Deep compare current data with saved snapshot
    const hasChanges = !deepEqual(currentData, savedSnapshotRef.current);
    setIsDirty(hasChanges);
  }, [currentData]);

  // Mark form as clean and update snapshot (call after successful save)
  const markClean = (newData) => {
    savedSnapshotRef.current = JSON.parse(JSON.stringify(newData || currentData));
    setIsDirty(false);
  };

  // Reset current data to initial snapshot (for discard)
  const resetToInitial = () => {
    setIsDirty(false);
    return savedSnapshotRef.current ? JSON.parse(JSON.stringify(savedSnapshotRef.current)) : null;
  };

  return {
    isDirty,
    markClean,
    resetToInitial
  };
}
