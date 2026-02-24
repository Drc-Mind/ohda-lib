import { recordSale } from '../../dist/sales/processor.js';

// Test credit note behavior
const result = recordSale({
    amount: -200000,
    label: "Test return",
    saleType: 'GOODS',
    vatRate: 18
}, 'fr');

console.log('Number of entries:', result.length);
console.log('\nEntry 1 (Invoice):');
console.log('Lines:', JSON.stringify(result[0].lines, null, 2));
console.log('Totals:', result[0].totals);
console.log('Is Balanced:', result[0].isBalanced);
