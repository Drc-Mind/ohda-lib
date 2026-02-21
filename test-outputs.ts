import { Ohada } from './src/index';

const ohada = new Ohada({ disableVAT: false, vat: 0.18 });

console.log("--- SALE ---");
const sale = ohada.recordSale({
  amount: 1000000,
  label: "Large Order #42",
  saleType: 'GOODS',
  vatRate: 18,
  payment: { method: 'bank', amount: 1180000 }
});
console.log(JSON.stringify(sale, null, 2));

console.log("\n--- PURCHASE ---");
const purchase = ohada.recordPurchase({
  amount: 500000,
  label: "Vendor Stock",
  charges: [{ type: 'Transport', amount: 25000 }],
  payments: [{ method: 'cash', amount: 619500 }]
});
console.log(JSON.stringify(purchase, null, 2));

console.log("\n--- EXPENSE ---");
const expense = ohada.recordExpense({
  category: 'ELECTRICITY',
  amount: 80000,
  label: "Monthly Bill",
  payment: { method: 'bank', amount: 80000 }
});
console.log(JSON.stringify(expense, null, 2));
