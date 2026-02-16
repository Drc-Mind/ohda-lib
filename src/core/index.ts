/**
 * Core Index
 * 
 * Entry point for the core data. Currently exports the loaded Chart of Accounts,
 * ensuring it is strictly typed and available for use throughout the library.
 */
import { CHART_OF_ACCOUNTS } from '../data/accounts-data';

export { CHART_OF_ACCOUNTS };
export * from './ohada';
export * from './account-resolver';
export * from './category-mapping';
