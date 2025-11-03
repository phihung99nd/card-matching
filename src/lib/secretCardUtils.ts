/**
 * Utility functions for managing unlocked secret cards in localStorage
 * Uses SHA-256 hashing to prevent users from editing localStorage to cheat
 */

const UNLOCKED_SECRET_CARDS_KEY = "unlockedSecretCards";

// Secret salt to make hashing more secure (in production, this could be a config value)
const HASH_SALT = "card-matching-secret-salt-2024";

// Cache for hashed URLs to avoid re-hashing the same URLs
const hashCache = new Map<string, string>();

export interface UnlockedCards {
  [hashedCardUrl: string]: boolean;
}

/**
 * Hash a card URL using SHA-256 to prevent cheating
 */
async function hashCardUrl(cardUrl: string): Promise<string> {
  // Check cache first
  if (hashCache.has(cardUrl)) {
    return hashCache.get(cardUrl)!;
  }

  try {
    // Combine URL with salt for better security
    const data = new TextEncoder().encode(cardUrl + HASH_SALT);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    
    // Cache the result
    hashCache.set(cardUrl, hashHex);
    return hashHex;
  } catch (error) {
    console.error("Error hashing card URL:", error);
    // Fallback to a simple hash if crypto API is not available
    return simpleHash(cardUrl);
  }
}

/**
 * Fallback simple hash function for environments without Web Crypto API
 */
function simpleHash(str: string): string {
  let hash = 0;
  const saltedStr = str + HASH_SALT;
  for (let i = 0; i < saltedStr.length; i++) {
    const char = saltedStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16).padStart(16, "0");
}

/**
 * Get all unlocked secret cards from localStorage (returns hashed keys)
 */
export function getUnlockedSecretCards(): UnlockedCards {
  try {
    const stored = localStorage.getItem(UNLOCKED_SECRET_CARDS_KEY);
    if (stored) {
      return JSON.parse(stored) as UnlockedCards;
    }
  } catch (error) {
    console.error("Error reading unlocked secret cards:", error);
  }
  return {};
}

/**
 * Check if a secret card is unlocked
 */
export async function isSecretCardUnlocked(cardUrl: string): Promise<boolean> {
  const hashedUrl = await hashCardUrl(cardUrl);
  const unlocked = getUnlockedSecretCards();
  return unlocked[hashedUrl] === true;
}

/**
 * Unlock a secret card and save to localStorage
 */
export async function unlockSecretCard(cardUrl: string): Promise<void> {
  const hashedUrl = await hashCardUrl(cardUrl);
  const unlocked = getUnlockedSecretCards();
  unlocked[hashedUrl] = true;
  try {
    localStorage.setItem(UNLOCKED_SECRET_CARDS_KEY, JSON.stringify(unlocked));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("secretCardUnlocked"));
  } catch (error) {
    console.error("Error saving unlocked secret card:", error);
  }
}

/**
 * Unlock multiple secret cards at once
 */
export async function unlockSecretCards(cardUrls: string[]): Promise<void> {
  const unlocked = getUnlockedSecretCards();
  for (const url of cardUrls) {
    const hashedUrl = await hashCardUrl(url);
    unlocked[hashedUrl] = true;
  }
  try {
    localStorage.setItem(UNLOCKED_SECRET_CARDS_KEY, JSON.stringify(unlocked));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("secretCardUnlocked"));
  } catch (error) {
    console.error("Error saving unlocked secret cards:", error);
  }
}

