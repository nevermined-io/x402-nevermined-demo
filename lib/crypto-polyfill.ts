/**
 * Crypto polyfill for Next.js
 * 
 * This file provides polyfills for crypto functions that might not be
 * properly available in the Next.js Turbopack environment.
 */

// Ensure the crypto object exists
if (typeof window !== 'undefined' && !window.crypto) {
  console.warn('Crypto API not available, using polyfill');
  // @ts-expect-error - Intentionally adding crypto object to window
  window.crypto = {};
}

// Ensure getRandomValues is available
if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.getRandomValues)) {
  // If crypto exists but getRandomValues is missing
  if (window.crypto && !window.crypto.getRandomValues) {
    window.crypto.getRandomValues = function(array: ArrayBufferView) {
      const typedArray = array as Uint8Array;
      for (let i = 0; i < typedArray.length; i++) {
        typedArray[i] = Math.floor(Math.random() * 256);
      }
      return typedArray;
    };
  } 
  // If crypto doesn't exist at all
  else if (!window.crypto) {
    window.crypto = {
      getRandomValues: function(array: ArrayBufferView) {
        const typedArray = array as Uint8Array;
        for (let i = 0; i < typedArray.length; i++) {
          typedArray[i] = Math.floor(Math.random() * 256);
        }
        return typedArray;
      },
      // Add any other required methods
      subtle: {} as SubtleCrypto
    } as Crypto;
  }
  
  console.log("[Polyfill] Added crypto.getRandomValues");
}

export {}; 