/**
 * DOM Vendors index - exports all dating site implementations and utilities
 */

// Interfaces
export type { IDatingSite, DatingSiteSelectors } from './IDatingSite';

// Site implementations
export { TinderSite } from './TinderSite';
export { BadooSite } from './BadooSite';

// Registry
export { VendorRegistry, VENDORS } from './VendorRegistry';
