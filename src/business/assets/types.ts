import { JournalEntry } from '../../types';

export type AssetType = 
  | 'INTANGIBLE'              // 21 - Immobilisations incorporelles
  | 'SOFTWARE'                // 2183 - Logiciels
  | 'LAND'                   // 22 - Terrains
  | 'BUILDING'               // 23 - Bâtiments
  | 'INDUSTRIAL_EQUIPMENT'   // 241 - Matériel industriel
  | 'OFFICE_EQUIPMENT'       // 244 - Matériel de bureau
  | 'COMPUTER_EQUIPMENT'     // 2444 - Matériel informatique
  | 'TRANSPORT_EQUIPMENT'    // 245 - Matériel de transport
  | 'FURNITURE'              // 2447 - Mobilier
  | 'FINANCIAL_ASSET';       // 27 - Immobilisations financières

export interface AssetComponent {
  name: string;
  amount: number;
  type?: AssetType; // Allows overriding the account for specific components
  account?: string; // Direct account override
}

export interface AssetInput {
  assetName: string;
  type: AssetType;
  amount: number; // Base purchase price
  date?: Date;
  
  // Acquisition Cost items
  transport?: number;
  installation?: number;
  customs?: number;
  otherCosts?: number;
  
  // Dismantling Provision
  dismantlingEstimate?: number;
  
  // Component Approach
  components?: AssetComponent[];
  
  // VAT Handling
  vatAmount?: number;
  vatRate?: number;
  
  // Payment
  payment?: {
    method: 'cash' | 'bank';
    amount: number;
  };
}
