import { LoggerService } from './LoggerService';
import { MessageService } from './MessageService';
import { VENDORS } from '../dom/vendors';
import { MessageType } from '../types/common.types';

/**
 * SiteDetectionService - Handles detection of dating sites
 */
export class SiteDetectionService {
  private static instance: SiteDetectionService;
  private readonly logger: LoggerService;
  private readonly messageService: MessageService;

  private constructor() {
    this.logger = LoggerService.getInstance('SiteDetectionService');
    this.messageService = MessageService.getInstance();
  }

  /**
   * Get singleton instance of SiteDetectionService
   */
  public static getInstance(): SiteDetectionService {
    if (!SiteDetectionService.instance) {
      SiteDetectionService.instance = new SiteDetectionService();
    }
    return SiteDetectionService.instance;
  }

  /**
   * Detect current dating site and notify background script
   */
  public detectAndNotifySite(): void {
    const hostname = window.location.hostname.toLowerCase();
    const url = window.location.href;
    
    this.logger.info(`Content script loaded on: ${hostname}`);
    this.logger.debug(`Full URL: ${url}`);
    this.logger.debug(`Available sites: ${VENDORS.getAllSiteIds().join(', ')}`);

    // Check all registered sites
    const allSites = VENDORS.getAllSites();
    this.logger.debug(`Checking ${allSites.length} registered sites`);
    
    for (const site of allSites) {
      this.logger.debug(`Checking site: ${site.label} (${site.id})`);
      
      if (site.isCurrentSite && site.isCurrentSite()) {
        this.logger.info(`✅ Detected site: ${site.label} (${site.id})`);
        this.notifySiteDetected(site.id);
        return;
      } else {
        this.logger.debug(`❌ Not ${site.label}: ${site.id}`);
      }
    }
    
    // If no site detected, try manual detection for Badoo
    if (hostname.includes('badoo.com')) {
      this.logger.info('🔄 Manual Badoo detection - sending SITE_DETECTED');
      this.notifySiteDetected('badoo');
      return;
    }

    this.logger.warn('❌ No supported dating site detected');
    this.logger.debug(`Hostname: ${hostname}, URL: ${url}`);
  }

  /**
   * Notify background script about detected site
   */
  private notifySiteDetected(siteId: string): void {
    this.messageService.send(MessageType.SITE_DETECTED, { siteId });
  }
}
