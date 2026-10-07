import { GovernmentScheme, SchemeCategory } from '@/types';

export const SCHEME_CATEGORY_LABELS: Record<SchemeCategory, string> = {
  FINANCIAL_SUPPORT: 'Financial Support',
  MATERNITY_CARE: 'Maternity Care',
  NUTRITION: 'Nutrition',
  IMMUNIZATION: 'Immunization',
};

// General descriptions of central maternal and child health schemes. No
// benefit amounts, eligibility results, or application status are stored
// here — amounts and rules are revised over time and vary by state, and
// anything specific to one mother has to come from the backend later.
export const governmentSchemes: GovernmentScheme[] = [
  {
    id: 'scheme_pmmvy',
    title: 'Pradhan Mantri Matru Vandana Yojana',
    shortName: 'PMMVY',
    category: 'FINANCIAL_SUPPORT',
    description: 'A maternity benefit paid directly to the mother to support rest and nutrition around childbirth.',
    overview:
      'PMMVY is a central maternity benefit programme. It provides a cash benefit, transferred directly to the mother’s bank or post office account, to partly make up for lost wages and to encourage timely antenatal care and childhood immunization.',
    keyBenefits: [
      'Cash benefit sent directly to the mother’s own account',
      'Linked to pregnancy registration, antenatal check-ups and the child’s first vaccinations',
      'Registration support through Anganwadi centres and health facilities',
    ],
    implementedBy: 'Ministry of Women and Child Development',
    officialWebsite: 'https://pmmvy.wcd.gov.in',
  },
  {
    id: 'scheme_jsy',
    title: 'Janani Suraksha Yojana',
    shortName: 'JSY',
    category: 'FINANCIAL_SUPPORT',
    description: 'Cash assistance that encourages mothers to deliver in a hospital or health centre.',
    overview:
      'JSY is a safe motherhood programme under the National Health Mission. It promotes institutional delivery by giving cash assistance to mothers who deliver in a government or accredited health facility, with an ASHA worker supporting the mother through pregnancy and delivery.',
    keyBenefits: [
      'Cash assistance after delivery in a government or accredited facility',
      'Support from an ASHA worker during pregnancy, delivery and after birth',
      'Encourages skilled care at birth for mother and newborn',
    ],
    implementedBy: 'Ministry of Health and Family Welfare (National Health Mission)',
    officialWebsite: 'https://nhm.gov.in/index1.php?lang=1&level=3&lid=309&sublinkid=841',
  },
  {
    id: 'scheme_jssk',
    title: 'Janani Shishu Suraksha Karyakram',
    shortName: 'JSSK',
    category: 'MATERNITY_CARE',
    description: 'Free delivery and newborn care services at government health facilities.',
    overview:
      'JSSK entitles pregnant women and sick infants to free care at public health institutions, so that families do not have to pay out of pocket for delivery and newborn treatment.',
    keyBenefits: [
      'Free normal and caesarean delivery at government facilities',
      'Free medicines, tests, blood and meals during the hospital stay',
      'Free transport from home to the facility, between facilities, and back home',
      'Free treatment for sick infants',
    ],
    implementedBy: 'Ministry of Health and Family Welfare (National Health Mission)',
    officialWebsite: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308',
  },
  {
    id: 'scheme_pmsma',
    title: 'Pradhan Mantri Surakshit Matritva Abhiyan',
    shortName: 'PMSMA',
    category: 'MATERNITY_CARE',
    description: 'A free antenatal check-up by a doctor on a fixed day every month.',
    overview:
      'PMSMA offers assured, free antenatal care on the 9th of every month at government health facilities for women in the second and third trimesters of pregnancy, helping to find and follow up high-risk pregnancies early.',
    keyBenefits: [
      'Free check-up by a doctor or specialist on the 9th of each month',
      'Free tests and basic investigations during the visit',
      'Early identification and follow-up of high-risk pregnancies',
    ],
    implementedBy: 'Ministry of Health and Family Welfare',
    officialWebsite: 'https://pmsma.mohfw.gov.in',
  },
  {
    id: 'scheme_suman',
    title: 'Surakshit Matritva Aashwasan',
    shortName: 'SUMAN',
    category: 'MATERNITY_CARE',
    description: 'Assured, respectful and free maternity and newborn care at public health facilities.',
    overview:
      'SUMAN brings existing maternal and newborn services together under one assurance: every woman and newborn visiting a public health facility should receive dignified, respectful, quality care at no cost, with no denial of services.',
    keyBenefits: [
      'Free antenatal, delivery and postnatal care at public facilities',
      'Respectful and dignified care for mother and newborn',
      'A way to raise and resolve grievances about care received',
    ],
    implementedBy: 'Ministry of Health and Family Welfare',
  },
  {
    id: 'scheme_poshan',
    title: 'POSHAN Abhiyaan',
    category: 'NUTRITION',
    description: 'Nutrition support for pregnant women, breastfeeding mothers and young children through Anganwadi centres.',
    overview:
      'POSHAN Abhiyaan, now part of Saksham Anganwadi and Poshan 2.0, works to improve the nutrition of pregnant women, breastfeeding mothers and children. Services are delivered mainly through the local Anganwadi centre.',
    keyBenefits: [
      'Supplementary nutrition through Anganwadi centres',
      'Growth monitoring for young children',
      'Nutrition and health counselling for mothers and families',
    ],
    implementedBy: 'Ministry of Women and Child Development',
    officialWebsite: 'https://www.poshanabhiyaan.gov.in',
  },
  {
    id: 'scheme_uip',
    title: 'Universal Immunization Programme',
    shortName: 'UIP',
    category: 'IMMUNIZATION',
    description: 'Free vaccines for pregnant women and children at government health facilities and outreach sessions.',
    overview:
      'The Universal Immunization Programme provides free vaccines for children and pregnant women against vaccine-preventable diseases. Mission Indradhanush is its drive to reach children and pregnant women who have missed their vaccines.',
    keyBenefits: [
      'Free vaccines for children as per the national immunization schedule',
      'Free tetanus-containing vaccine for pregnant women',
      'Available at government facilities, Anganwadi centres and outreach sessions',
    ],
    implementedBy: 'Ministry of Health and Family Welfare',
    officialWebsite: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=824&lid=220',
  },
];
