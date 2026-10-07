export type SchemeCategory = 'FINANCIAL_SUPPORT' | 'MATERNITY_CARE' | 'NUTRITION' | 'IMMUNIZATION';

// General, public information about a government scheme. Deliberately holds
// no per-mother fields (eligibility result, application/claim status) — those
// need real backend data and are not part of this foundation.
export interface GovernmentScheme {
  id: string;
  title: string;
  shortName?: string;
  category: SchemeCategory;
  description: string; // short summary shown on the card
  overview: string;
  keyBenefits: string[];
  implementedBy: string;
  officialWebsite?: string; // only set when verified to be an official government site
}
