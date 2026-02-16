/**
 * Account Resolver
 * 
 * This file contains the logic for finding and validating account codes 
 * within the OHADA chart of accounts. It supports exact and fuzzy matching
 * to help resolve user-provided labels to standard account codes.
 */
import { CHART_OF_ACCOUNTS } from './index';
import { AccountNode, ChartOfAccounts } from '../types';

export class AccountResolver {
  private codeMap: Map<string, AccountNode> = new Map();
  private nameIndex: Map<string, string> = new Map(); // normalized name -> code

  constructor(chart: ChartOfAccounts = CHART_OF_ACCOUNTS) {
    this.indexChart(chart);
  }

  private indexChart(chart: ChartOfAccounts) {
    for (const [code, name] of Object.entries(chart)) {
      this.nameIndex.set(this.normalize(name), code);
      this.codeMap.set(code, { code, name });
    }
  }


  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]/g, ""); // remove non-alphanumeric
  }

  /**
   * Finds an account code by label (exact or fuzzy match).
   */
  findAccountByLabel(label: string): string | null {
    const normalizedLabel = this.normalize(label);

    // 1. Exact match on index
    if (this.nameIndex.has(normalizedLabel)) {
      return this.nameIndex.get(normalizedLabel)!;
    }

    // 2. Fuzzy / Keyword Search
    // This is O(N) scan of map keys, acceptable for default chart size (~1000 items)
    // Heuristic: Check if account name contains the label or label contains account name
    for (const [name, code] of this.nameIndex.entries()) {
      if (name.includes(normalizedLabel) || normalizedLabel.includes(name)) {
        return code;
      }
    }
    
    // Explicit hardcoded fallbacks for common English terms to French SYSCOHADA
    // In a real app, this should be a configurable dictionary.
    if (normalizedLabel.includes("transport")) return "622"; // Transport
    if (normalizedLabel.includes("advertising") || normalizedLabel.includes("ads")) return "623"; // Publicité
    if (normalizedLabel.includes("bank") || normalizedLabel.includes("fees")) return "631"; // Frais bancaires
    if (normalizedLabel.includes("rent")) return "621"; // Locations
    
    // Office / Supplies
    if (normalizedLabel.includes("laptop") || normalizedLabel.includes("computer") || normalizedLabel.includes("ordinateur")) return "2443"; // Matériel de bureau
    if (normalizedLabel.includes("ink") || normalizedLabel.includes("encre") || normalizedLabel.includes("cartridge")) return "604"; // Matières consommables
    if (normalizedLabel.includes("paper") || normalizedLabel.includes("papier")) return "604";
    if (normalizedLabel.includes("cleaning") || normalizedLabel.includes("nettoyage")) return "605"; // Autres achats (entretien) or 604
    if (normalizedLabel.includes("printer")) return "2444"; // Matériel mobilier

    return null;
  }

  /**
   * Validates if an account code exists in the chart.
   */
  validateAccountCode(code: string): boolean {
    return this.codeMap.has(code);
  }

  getAccountName(code: string): string | undefined {
    return this.codeMap.get(code)?.name;
  }
}
