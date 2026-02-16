import { Ohada } from '../../src/core/ohada';
import { recordPurchase } from '../../src/purchase';
import { JournalEntry } from '../../src/types';

function logEntry(name: string, entry: JournalEntry) {
  console.log(`\n--- Test: ${name} ---`);
  console.log(`Date: ${entry.date}`);
  console.log(`Balanced: ${entry.isBalanced ? 'YES' : 'NO'}`);
  console.log('Lines:');
  console.log('Account'.padEnd(10), '|', 'Label'.padEnd(30), '|', 'Debit'.padStart(10), '|', 'Credit'.padStart(10));
  console.log('-'.repeat(70));
  entry.lines.forEach(l => {
    console.log(l.account.padEnd(10), '|', l.label.padEnd(30), '|', l.debit.toString().padStart(10), '|', l.credit.toString().padStart(10));
  });
  console.log('-'.repeat(70));
  console.log('TOTALS'.padEnd(43), '|', entry.totals.debit.toString().padStart(10), '|', entry.totals.credit.toString().padStart(10));
}

async function runManualTests() {
  const ohada = new Ohada();

  // Scenario A: 100k HT, Credit
  console.log('\n=========================================');
  console.log('SCENARIO A: 100% CREDIT');
  const resultsA = ohada.recordPurchase({ 
    amount: 100000, 
    label: "Achat Marchandises" 
  });
  resultsA.forEach((entry, i) => logEntry(`Entry ${i+1}: ${i === 0 ? 'Facture' : 'Paiement'}`, entry));

  // Scenario B: 100k HT, Cash (Invoice then Payment)
  console.log('\n=========================================');
  console.log('SCENARIO B: 100% CASH');
  const resultsB = ohada.recordPurchase({ 
    amount: 100000, 
    label: "Achat au Comptant",
    payments: [{ method: 'cash', amount: 118000 }] 
  });
  resultsB.forEach((entry, i) => logEntry(`Entry ${i+1}: ${i === 0 ? 'Facture' : 'Paiement'}`, entry));

  // Scenario C: 100k HT, Split (50% Bank, 50% Credit)
  console.log('\n=========================================');
  console.log('SCENARIO C: SPLIT (50% BANK)');
  const resultsC = ohada.recordPurchase({ 
    amount: 100000, 
    label: "Achat Mixte",
    charges: [{ type: 'Transport', amount: 5000 }], 
    payments: [{ method: 'bank', amount: 61950 }] 
  });
  resultsC.forEach((entry, i) => logEntry(`Entry ${i+1}: ${i === 0 ? 'Facture' : 'Paiement'}`, entry));
}

runManualTests().catch(console.error);
