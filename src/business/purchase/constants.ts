/**
 * Purchase Fees with linked OHADA accounts
 */
export const PurchaseFees = {
  Transport: { label: "Transport", account: "6015" },
  Customs: { label: "Douane", account: "6014" },
  Handling: { label: "Manutention", account: "6015" }, 
  Insurance: { label: "Assurance", account: "6015" },
  Commission: { label: "Commission", account: "622" },
  Other: { label: "Divers", account: "6015" }
} as const;

// Helper type to capture the structure of a fee
export type PurchaseFeeType = typeof PurchaseFees[keyof typeof PurchaseFees];
