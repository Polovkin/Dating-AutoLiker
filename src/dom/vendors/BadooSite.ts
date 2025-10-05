import { LoggerService } from '@/services';
import type { IDatingSite, DatingSiteSelectors } from './IDatingSite';

/**
 * Badoo site implementation
 * Handles interactions with Badoo's web interface
 */
export class BadooSite implements IDatingSite {
  public readonly id: string = 'badoo';
  public readonly label: string = 'Badoo';
  public readonly selectors: DatingSiteSelectors;

  private readonly logger: LoggerService;

  constructor() {
    this.logger = LoggerService.getInstance('BadooSite');
    
    // Initialize selectors for Badoo web interface
    this.selectors = {
      likeButton: 'button[data-qa="profile-card-action-vote-yes"], [data-testid="like-button"], .js-profile-header-like, .like-button, [aria-label*="like"], button[title*="Like"]',
      dislikeButton: '[data-testid="pass-button"], .js-profile-header-pass, .pass-button, [aria-label*="pass"], button[title*="Pass"]',
      profileCard: '[data-testid="profile-card"], .profile-card, .js-profile-card, .card',
      popupMatch: '[data-testid="match-modal"], .match-modal, .popup--match, .modal--match, .js-match-popup'
    };

    this.logger.debug('BadooSite initialized with selectors:', this.selectors);
  }

  /**
   * Perform a swipe action on Badoo
   * @param action - The type of swipe action to perform ('like' or 'dislike')
   * @returns true if the action was successful, false otherwise
   */
  public swipe(action: 'like' | 'dislike'): boolean {
    this.logger.info(`🎯 BadooSite.swipe() called with action: ${action}`);

    try {
      const buttonSelector = action === 'like'
        ? this.selectors.likeButton
        : this.selectors.dislikeButton;

      this.logger.info(`🔍 Looking for ${action} button with selector: ${buttonSelector}`);
      this.logger.debug(`📋 Full selector string: "${buttonSelector}"`);

      // Split selector to check each part
      const selectorParts = buttonSelector.split(', ');
      this.logger.debug(`🔍 Checking ${selectorParts.length} selector parts:`);
      
      for (let i = 0; i < selectorParts.length; i++) {
        const part = selectorParts[i].trim();
        this.logger.debug(`  ${i + 1}. "${part}"`);
        
        const element = document.querySelector(part);
        if (element) {
          this.logger.info(`✅ Found ${action} button with selector part ${i + 1}: "${part}"`);
          this.logger.debug(`📍 Element details:`, {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: element.textContent?.trim().substring(0, 50) + '...'
          });
          
          // Try to click the button
          this.logger.info(`🖱️ Attempting to click ${action} button`);
          try {
            (element as HTMLElement).click();
            this.logger.info(`✅ Successfully clicked ${action} button`);
            return true;
          } catch (clickError) {
            this.logger.error(`❌ Failed to click ${action} button:`, clickError);
            return false;
          }
        } else {
          this.logger.debug(`❌ No element found for selector part ${i + 1}: "${part}"`);
        }
      }

      // If no button found, log additional debugging info
      this.logger.warn(`❌ No ${action} button found with any selector part`);
      this.logger.debug(`🔍 Current page URL: ${window.location.href}`);
      this.logger.debug(`🔍 Current page title: ${document.title}`);
      
      // Log all buttons on the page for debugging
      const allButtons = document.querySelectorAll('button');
      this.logger.debug(`🔍 Found ${allButtons.length} buttons on page:`);
      allButtons.forEach((btn, index) => {
        if (index < 10) { // Limit to first 10 buttons
          this.logger.debug(`  Button ${index + 1}:`, {
            tagName: btn.tagName,
            className: btn.className,
            id: btn.id,
            'data-qa': btn.getAttribute('data-qa'),
            'data-testid': btn.getAttribute('data-testid'),
            textContent: btn.textContent?.trim().substring(0, 30)
          });
        }
      });

      return false;

    } catch (error) {
      this.logger.error(`❌ Failed to perform ${action} action:`, error);
      return false;
    }
  }

  /**
   * Detect if a popup/modal is currently displayed on Badoo
   * @returns true if a popup is detected, false otherwise
   */
  public detectPopup(): boolean {
    this.logger.debug('Checking for popup on Badoo');

    try {
      // TODO: Implement actual popup detection for Badoo
      // This will check for:
      // - Match modals
      // - Subscription prompts
      // - Rate limiting messages
      // - Other overlay dialogs

      if (!this.selectors.popupMatch) {
        this.logger.debug('No popup selector defined for Badoo');
        return false;
      }

      const popup = document.querySelector(this.selectors.popupMatch);
      const hasPopup = popup !== null;

      this.logger.debug(`Popup detected: ${hasPopup}`);
      return hasPopup;

    } catch (error) {
      this.logger.error('Failed to detect popup:', error);
      return false;
    }
  }

  /**
   * Check if the current page is Badoo
   * @returns true if we're on Badoo, false otherwise
   */
  public isCurrentSite(): boolean {
    const hostname = window.location.hostname.toLowerCase();
    const url = window.location.href;
    const isBadoo = hostname.includes('badoo.com');
    
    // For development/testing - allow localhost
    const isDevelopment = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    const result = isBadoo || isDevelopment;
    
    this.logger.debug(`BadooSite.isCurrentSite() - hostname: ${hostname}, URL: ${url}, result: ${result} (dev: ${isDevelopment})`);
    return result;
  }

  /**
   * Get the current profile card element
   * @returns the profile card element or null if not found
   */
  public getCurrentProfileCard(): Element | null {
    try {
      const card = document.querySelector(this.selectors.profileCard);
      this.logger.debug(`Profile card found: ${card !== null}`);
      return card;
    } catch (error) {
      this.logger.error('Failed to get current profile card:', error);
      return null;
    }
  }
}
