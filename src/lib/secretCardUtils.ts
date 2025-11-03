/**
 * Utility functions for managing unlocked secret cards in localStorage
 */

const UNLOCKED_SECRET_CARDS_KEY = "unlockedSecretCards";

export interface UnlockedCards {
  [cardUrl: string]: boolean;
}

/**
 * Get all unlocked secret cards from localStorage
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
export function isSecretCardUnlocked(cardUrl: string): boolean {
  const unlocked = getUnlockedSecretCards();
  return unlocked[cardUrl] === true;
}

/**
 * Unlock a secret card and save to localStorage
 */
export function unlockSecretCard(cardUrl: string): void {
  const unlocked = getUnlockedSecretCards();
  unlocked[cardUrl] = true;
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
export function unlockSecretCards(cardUrls: string[]): void {
  const unlocked = getUnlockedSecretCards();
  for (const url of cardUrls) {
    unlocked[url] = true;
  }
  try {
    localStorage.setItem(UNLOCKED_SECRET_CARDS_KEY, JSON.stringify(unlocked));
  } catch (error) {
    console.error("Error saving unlocked secret cards:", error);
  }
}

