/**
 * Interface for dating site implementations
 * Defines the contract that all dating site adapters must follow
 */

/**
 * CSS selectors for different elements on dating sites
 */
export interface DatingSiteSelectors {
  /** CSS selector for the like button */
  likeButton: string;
  /** CSS selector for the dislike button */
  dislikeButton: string;
  /** CSS selector for the main profile card container */
  profileCard: string;
  /** CSS selector for popup/match modal (optional) */
  popupMatch?: string;
}

/**
 * Main interface that all dating site implementations must implement
 */
export interface IDatingSite {
  /** Unique identifier for the dating site */
  readonly id: string;
  /** Human-readable name of the dating site */
  readonly label: string;
  /** CSS selectors for various elements on the site */
  readonly selectors: DatingSiteSelectors;

  /**
   * Perform a swipe action (like or dislike)
   * @param action - The type of swipe action to perform
   * @returns true if the action was successful, false otherwise
   */
  swipe(action: 'like' | 'dislike'): boolean;

  /**
   * Detect if a popup/modal is currently displayed
   * @returns true if a popup is detected, false otherwise
   */
  detectPopup(): boolean;

  /**
   * Check if the current page is this dating site
   * @returns true if we're on this dating site, false otherwise
   */
  isCurrentSite(): boolean;

  /**
   * Get the current profile card element
   * @returns the profile card element or null if not found
   */
  getCurrentProfileCard(): Element | null;
}
