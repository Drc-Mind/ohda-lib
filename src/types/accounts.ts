export interface AccountNode {
  code: string;
  name: string;
  subaccounts?: AccountNode[];
}

export interface AccountClass {
  class: string;
  name: string;
  accounts: AccountNode[];
}

export type ChartOfAccounts = AccountClass[];
