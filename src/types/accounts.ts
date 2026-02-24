export interface AccountNode {
  code: string;
  name: string;
  subaccounts?: AccountNode[];
}

// Deprecated: Use Record<string, string> for production data
export interface AccountClass {
  class: string;
  name: string;
  accounts: AccountNode[];
}

export type ChartOfAccounts = Record<string, string>;
