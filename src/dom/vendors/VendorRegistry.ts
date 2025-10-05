import { LoggerService } from '@/services';
import type { IDatingSite } from './IDatingSite';
import { TinderSite } from './TinderSite';

/**
 * Registry for managing dating site implementations
 * Provides centralized access to all supported dating sites
 */
export class VendorRegistry {
  private static instance: VendorRegistry;
  private readonly logger: LoggerService;
  private readonly vendors: Map<string, IDatingSite>;

  private constructor() {
    this.logger = LoggerService.getInstance('VendorRegistry');
    this.vendors = new Map();
    this.initializeVendors();
  }

  /**
   * Get singleton instance of VendorRegistry
   */
  public static getInstance(): VendorRegistry {
    if (!VendorRegistry.instance) {
      VendorRegistry.instance = new VendorRegistry();
    }
    return VendorRegistry.instance;
  }

  /**
   * Initialize all available dating site implementations
   */
  private initializeVendors(): void {
    this.logger.info('Initializing dating site vendors');

    // Register Tinder
    const tinderSite = new TinderSite();
    this.vendors.set(tinderSite.id, tinderSite);
    this.logger.debug(`Registered vendor: ${tinderSite.label} (${tinderSite.id})`);

    // TODO: Add more dating sites here
    // const bumbleSite = new BumbleSite();
    // this.vendors.set(bumbleSite.id, bumbleSite);
    // this.logger.debug(`Registered vendor: ${bumbleSite.label} (${bumbleSite.id})`);

    this.logger.info(`Total vendors registered: ${this.vendors.size}`);
  }

  /**
   * Get a dating site implementation by its ID
   * @param id - The unique identifier of the dating site
   * @returns the dating site implementation or null if not found
   */
  public getSiteById(id: string): IDatingSite | null {
    const site = this.vendors.get(id);

    if (site) {
      this.logger.debug(`Found site by ID: ${id}`);
      return site;
    } else {
      this.logger.warn(`Site not found for ID: ${id}`);
      return null;
    }
  }

  /**
   * Get all registered dating site IDs
   * @returns array of all registered site IDs
   */
  public getAllSiteIds(): string[] {
    return Array.from(this.vendors.keys());
  }

  /**
   * Get all registered dating sites
   * @returns array of all registered site implementations
   */
  public getAllSites(): IDatingSite[] {
    return Array.from(this.vendors.values());
  }

  /**
   * Get site information for all registered sites
   * @returns array of site info objects with id and label
   */
  public getAllSiteInfo(): Array<{ id: string; label: string }> {
    return this.getAllSites().map(site => ({
      id: site.id,
      label: site.label
    }));
  }

  /**
   * Check if a site is registered
   * @param id - The site ID to check
   * @returns true if the site is registered, false otherwise
   */
  public hasSite(id: string): boolean {
    return this.vendors.has(id);
  }

  /**
   * Get the count of registered sites
   * @returns number of registered sites
   */
  public getSiteCount(): number {
    return this.vendors.size;
  }
}

/**
 * Pre-configured registry instance for easy access
 */
export const VENDORS = VendorRegistry.getInstance();
