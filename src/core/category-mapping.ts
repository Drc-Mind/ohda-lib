/**
 * Category Mapping
 * 
 * Defines the mapping between high-level purchase charge categories (e.g., Transport, Customs)
 * and their corresponding OHADA account codes. This simplifies the accounting process
 * by providing sensible defaults for common expense types.
 */
import { PurchaseChargeCategory } from '../types/categories';

export const PURCHASE_CHARGE_MAPPING: Record<PurchaseChargeCategory, string> = {
    [PurchaseChargeCategory.Transport]: '6015', // Frais sur achats
    [PurchaseChargeCategory.Douane]: '6014', // Droits de douane
    [PurchaseChargeCategory.Manutention]: '6015', // or 625 depending on context, usually 6015 for landed cost
    [PurchaseChargeCategory.Assurance]: '6015', // Frais accessoires d'achat
    [PurchaseChargeCategory.Commission]: '622', // Commissions et courtages
    [PurchaseChargeCategory.NonStockedSupplies]: '604',
    [PurchaseChargeCategory.Other]: '6015'
};
