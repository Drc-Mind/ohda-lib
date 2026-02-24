import { describe, it } from 'vitest';
import { Ohada } from '../src/index';

describe('Showcase Outputs', () => {
  it('generate outputs', () => {
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
      category: 'OFFICE_SUPPLIES',
      amount: 80000,
      label: "Office Materials",
      payment: { method: 'bank', amount: 94400 } // HT 80k + 18% = 94.4k
    });
    console.log(JSON.stringify(expense, null, 2));

    console.log("\n--- ASSET ---");
    const asset = ohada.recordAsset({
      assetName: "Server Dell",
      type: 'COMPUTER_EQUIPMENT',
      amount: 2500000,
      transport: 50000,
      vatRate: 18,
      payment: { method: 'bank', amount: 3009000 } // Total TTC: (2.5M + 50k) * 1.18 = 3.009M
    });
    console.log(JSON.stringify(asset, null, 2));
  });
});
