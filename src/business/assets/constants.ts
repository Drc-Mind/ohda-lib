import { AssetType } from './types';

export const ASSET_ACCOUNTS: Record<AssetType, string> = {
  INTANGIBLE: '21',
  SOFTWARE: '2183',
  LAND: '22',
  BUILDING: '23',
  INDUSTRIAL_EQUIPMENT: '241',
  OFFICE_EQUIPMENT: '244',
  COMPUTER_EQUIPMENT: '2444',
  TRANSPORT_EQUIPMENT: '245',
  FURNITURE: '2447',
  FINANCIAL_ASSET: '27'
};

export const ASSET_COMMON_ACCOUNTS = {
  INVESTMENT_SUPPLIER: '4812', // Fournisseurs d'investissements
  VAT_ASSETS: '4451',          // Etat, TVA récupérable sur immobilisations
  DISMANTLING_PROVISION: '1984', // Provisions pour démantèlement
  CASH: '5711',
  BANK: '5211'
};
