import {
  AssistantQuickAction,
  AssistantResponse,
  UserRole
} from '@/types';
import { mockMother, mockChild, mockDoctor, mockHospital } from './mockData';

export const ROLE_GREETINGS: Record<UserRole, { title: string; subtitle: string; initialMessage: string }> = {
  mother: {
    title: 'MaaSuraksha Assistant',
    subtitle: 'Your care companion',
    initialMessage: `Hello ${mockMother.name.split(' ')[0]} 🌷\nHow can I help you today? I can help you track baby ${mockChild.name.split(' ')[0]}'s care milestones, upcoming appointments, and healthcare resources.`,
  },
  doctor: {
    title: 'Clinical Assistant',
    subtitle: 'Clinical care companion',
    initialMessage: `Good morning, ${mockDoctor.name}.\nHow can I help you? You can check today's clinical schedules, pending follow-ups, and immunization alerts.`,
  },
  hospital: {
    title: 'Facility Assistant',
    subtitle: 'Hospital operations companion',
    initialMessage: `Welcome back.\nWhat would you like to check? You can review facility bed overview, immunization monitoring, and maternity care outreach.`,
  },
  admin: {
    title: 'System Assistant',
    subtitle: 'Program governance companion',
    initialMessage: `Hello Admin.\nWhat would you like to review? You can inspect program beneficiary statistics, hospital activity, and district vaccination coverage.`,
  },
};

export const QUICK_ACTIONS_BY_ROLE: Record<UserRole, AssistantQuickAction[]> = {
  mother: [
    {
      id: 'm_coming_up',
      label: "What's coming up?",
      query: "What do I have coming up?",
      role: 'mother',
      iconName: 'CalendarCheck',
    },
    {
      id: 'm_next_vax',
      label: 'Next vaccination',
      query: "When is my child's next vaccination?",
      role: 'mother',
      iconName: 'Syringe',
    },
    {
      id: 'm_appointments',
      label: 'My appointments',
      query: 'What are my upcoming appointments?',
      role: 'mother',
      iconName: 'CalendarDays',
    },
    {
      id: 'm_timeline',
      label: 'My health timeline',
      query: 'Show my health timeline',
      role: 'mother',
      iconName: 'Activity',
    },
    {
      id: 'm_doctor',
      label: 'Contact my doctor',
      query: 'How do I contact my doctor?',
      role: 'mother',
      iconName: 'Stethoscope',
    },
    {
      id: 'm_schemes',
      label: 'Government schemes',
      query: 'Tell me about government maternity schemes',
      role: 'mother',
      iconName: 'Landmark',
    },
  ],
  doctor: [
    {
      id: 'd_today_apts',
      label: "Today's appointments",
      query: "Show today's appointments",
      role: 'doctor',
      iconName: 'CalendarCheck',
    },
    {
      id: 'd_followups',
      label: 'Patients needing follow-up',
      query: 'Which patients need follow-up?',
      role: 'doctor',
      iconName: 'UserCheck',
    },
    {
      id: 'd_vax_due',
      label: 'Vaccinations due',
      query: 'What vaccinations are due for my patients?',
      role: 'doctor',
      iconName: 'Syringe',
    },
    {
      id: 'd_summary',
      label: 'Patient summary',
      query: 'Give me a summary of my active patients',
      role: 'doctor',
      iconName: 'Users',
    },
    {
      id: 'd_messages',
      label: 'Messages',
      query: 'Show unread clinical messages',
      role: 'doctor',
      iconName: 'MessageCircle',
    },
  ],
  hospital: [
    {
      id: 'h_overview',
      label: "Today's overview",
      query: "Show today's facility overview",
      role: 'hospital',
      iconName: 'Building2',
    },
    {
      id: 'h_vax_due',
      label: 'Vaccinations due',
      query: 'What vaccinations are due at this facility?',
      role: 'hospital',
      iconName: 'Syringe',
    },
    {
      id: 'h_followups',
      label: 'Pending follow-ups',
      query: 'Show pending follow-up cases',
      role: 'hospital',
      iconName: 'Clock',
    },
    {
      id: 'h_beneficiary',
      label: 'Beneficiary summary',
      query: 'Show beneficiary statistics for facility',
      role: 'hospital',
      iconName: 'Users',
    },
    {
      id: 'h_announcements',
      label: 'Announcements',
      query: 'Show facility immunization announcements',
      role: 'hospital',
      iconName: 'Bell',
    },
  ],
  admin: [
    {
      id: 'a_overview',
      label: 'System overview',
      query: 'Show system overview',
      role: 'admin',
      iconName: 'ShieldCheck',
    },
    {
      id: 'a_stats',
      label: 'Beneficiary statistics',
      query: 'Show beneficiary statistics',
      role: 'admin',
      iconName: 'BarChart3',
    },
    {
      id: 'a_hospital',
      label: 'Hospital activity',
      query: 'Show hospital activity summary',
      role: 'admin',
      iconName: 'Building2',
    },
    {
      id: 'a_doctor',
      label: 'Doctor activity',
      query: 'Show doctor activity summary',
      role: 'admin',
      iconName: 'Stethoscope',
    },
    {
      id: 'a_vax_stats',
      label: 'Vaccination statistics',
      query: 'Show immunization coverage statistics',
      role: 'admin',
      iconName: 'Syringe',
    },
  ],
};

export const MOCK_RESPONSES: {
  keywords: string[];
  role?: UserRole;
  response: AssistantResponse;
}[] = [
  // SAFETY / MEDICAL TRIAGE (Healthcare safety first)
  {
    keywords: ['pain', 'fever', 'bleeding', 'dizzy', 'emergency', 'urgent', 'cramp', 'ache', 'vomit', 'swelling', 'infection', 'headache', 'bp', 'blood pressure'],
    response: {
      text: '⚠️ Healthcare Safety Notice: MaaSuraksha is an informational care companion and does not provide medical diagnoses or prescriptions. If you or your baby are experiencing severe discomfort, fever, bleeding, or unusual symptoms, please contact your doctor immediately or visit the hospital emergency desk.',
      actions: [
        { label: 'Contact Doctor', href: '/mother/doctor', variant: 'primary' },
        { label: 'Emergency Contact Info', href: '/mother/profile', variant: 'secondary' },
      ],
      suggestedFollowUps: ['How do I contact my doctor?', 'What are my appointments?'],
    },
  },

  // MOTHER SCENARIOS
  {
    keywords: ['vaccin', 'immuniz', 'shot', 'dose', 'uip', 'bcg', 'opv', 'pentavalent', 'rotavirus', 'pcv'],
    role: 'mother',
    response: {
      text: `${mockChild.name.split(' ')[0]}'s next scheduled vaccination is on 29 August 2026 at 10:30 AM (Pentavalent-1, OPV-1, Rotavirus-1, PCV-1). You can view the complete immunization schedule from Vaccinations.`,
      actions: [
        { label: 'View Vaccinations', href: '/mother/vaccinations', variant: 'primary' },
        { label: 'View Schedule', href: '/mother/schedule', variant: 'secondary' },
      ],
      suggestedFollowUps: ['What do I have coming up?', 'Contact my doctor'],
    },
  },
  {
    keywords: ['coming up', 'next', 'upcoming', 'schedule', 'todo', 'agenda'],
    role: 'mother',
    response: {
      text: 'You have a postpartum and pediatric check-up scheduled for 29 August at 10:30 AM at Sunrise Women & Children Hospital with Dr. Priya Menon.',
      actions: [
        { label: 'View Appointments', href: '/mother/appointments', variant: 'primary' },
        { label: 'View Schedule', href: '/mother/schedule', variant: 'secondary' },
      ],
      suggestedFollowUps: ["When is my child's next vaccination?", 'Contact my doctor'],
    },
  },
  {
    keywords: ['doctor', 'dr', 'priya', 'gynecologist', 'obstetrician', 'consultant', 'clinic'],
    role: 'mother',
    response: {
      text: `Your assigned doctor is ${mockDoctor.name} (${mockDoctor.specialization}). She is available Monday, Wednesday, Friday, and Saturday at ${mockHospital.name}. You can contact her through My Doctor.`,
      actions: [
        { label: 'Contact Doctor', href: '/mother/doctor', variant: 'primary' },
        { label: 'Open Messages', href: '/mother/messages', variant: 'secondary' },
      ],
      suggestedFollowUps: ['What are my upcoming appointments?', 'My health timeline'],
    },
  },
  {
    keywords: ['appointment', 'visit', 'checkup', 'booking', 'hospital visit'],
    role: 'mother',
    response: {
      text: 'You have 1 upcoming checkup: "6-Week Postpartum & Pediatric Checkup" on 29 August 2026 at 10:30 AM in OPD Block A, Room 204 at Sunrise Women & Children Hospital.',
      actions: [
        { label: 'View Appointments', href: '/mother/appointments', variant: 'primary' },
        { label: 'Hospital Details', href: '/mother/doctor', variant: 'secondary' },
      ],
      suggestedFollowUps: ["When is my child's next vaccination?", 'Contact my doctor'],
    },
  },
  {
    keywords: ['child', 'baby', 'vihaan', 'infant', 'weight', 'growth', 'born'],
    role: 'mother',
    response: {
      text: `${mockChild.name} is currently ${mockChild.ageDisplay} old, weighing ${mockChild.currentWeightKg} kg (birth weight: ${mockChild.birthWeightKg} kg). Born at ${mockChild.birthHospital}. Blood group is ${mockChild.bloodGroup}.`,
      actions: [
        { label: 'View Child Profile', href: '/mother/child', variant: 'primary' },
        { label: 'View Vaccinations', href: '/mother/vaccinations', variant: 'secondary' },
      ],
      suggestedFollowUps: ["When is my child's next vaccination?", 'My health timeline'],
    },
  },
  {
    keywords: ['timeline', 'record', 'history', 'scan', 'report', 'lab', 'ultrasound'],
    role: 'mother',
    response: {
      text: 'Your Health Timeline compiles your antenatal checkups, delivery records from 18 July 2026, and upcoming milestone assessments. You can view full records in Health Timeline.',
      actions: [
        { label: 'Health Timeline', href: '/mother/timeline', variant: 'primary' },
        { label: 'View Documents', href: '/mother/documents', variant: 'secondary' },
      ],
      suggestedFollowUps: ['What do I have coming up?', 'View my profile'],
    },
  },
  {
    keywords: ['scheme', 'government', 'pmmvy', 'jsy', 'benefit', 'incentive', 'matru vandana', 'subsidy'],
    role: 'mother',
    response: {
      text: 'MaaSuraksha supports central and state maternity schemes including Pradhan Mantri Matru Vandana Yojana (PMMVY) and Janani Suraksha Yojana (JSY). Open Government Schemes to review eligibility and claim status.',
      actions: [
        { label: 'Government Schemes', href: '/mother/schemes', variant: 'primary' },
        { label: 'My Documents', href: '/mother/documents', variant: 'secondary' },
      ],
      suggestedFollowUps: ['Contact my doctor', 'What do I have coming up?'],
    },
  },
  {
    keywords: ['nutrition', 'diet', 'food', 'exercise', 'pelvic', 'hydration', 'postpartum care'],
    role: 'mother',
    response: {
      text: 'For postpartum week 5, hydration, iron and protein rich home meals, and gentle pelvic floor recovery exercises are recommended. You can browse expert meal and wellness guides in Nutrition & Exercise.',
      actions: [
        { label: 'Nutrition & Exercise', href: '/mother/nutrition', variant: 'primary' },
      ],
      suggestedFollowUps: ['What do I have coming up?', 'Contact my doctor'],
    },
  },
  {
    keywords: ['profile', 'account', 'personal', 'contact', 'address', 'blood group'],
    role: 'mother',
    response: {
      text: `Your profile: ${mockMother.name}, Age 32, Blood Group ${mockMother.bloodGroup}, Location: ${mockMother.location}. Emergency contact: ${mockMother.emergencyContact.name} (${mockMother.emergencyContact.relation}) - ${mockMother.emergencyContact.phone}.`,
      actions: [
        { label: 'View Full Profile', href: '/mother/profile', variant: 'primary' },
        { label: 'Care Settings', href: '/mother/settings', variant: 'secondary' },
      ],
      suggestedFollowUps: ['Show my child info', 'Contact my doctor'],
    },
  },
  {
    keywords: ['message', 'chat', 'inbox', 'consult', 'communication'],
    role: 'mother',
    response: {
      text: 'You can send non-emergency clinical queries directly to Dr. Priya Menon and receive notifications from the Sunrise Women & Children maternity desk.',
      actions: [
        { label: 'Open Messages', href: '/mother/messages', variant: 'primary' },
      ],
      suggestedFollowUps: ['Contact my doctor', 'What are my appointments?'],
    },
  },

  // DOCTOR SCENARIOS
  {
    keywords: ['today', 'appointment', 'schedule', 'clinic'],
    role: 'doctor',
    response: {
      text: '3 appointments are scheduled today. 1 patient has a pending follow-up.',
      actions: [
        { label: 'Switch Role / Explore', href: '/auth/login', variant: 'secondary' },
      ],
      suggestedFollowUps: ['Patients needing follow-up', 'Vaccinations due'],
    },
  },
  {
    keywords: ['follow-up', 'follow up', 'patient', 'review', 'high risk'],
    role: 'doctor',
    response: {
      text: 'Ananya Kapoor (Postpartum Week 5) and 2 other beneficiaries have milestone reviews scheduled this week. 1 high-risk pregnancy alert was flagged for antenatal monitoring.',
      suggestedFollowUps: ["Today's appointments", 'Vaccinations due'],
    },
  },
  {
    keywords: ['vaccin', 'immuniz', 'due', 'milestone'],
    role: 'doctor',
    response: {
      text: '14 infant immunization milestones are due across your assigned beneficiary roster for August. All cold chain storage verifications are logged as normal.',
      suggestedFollowUps: ["Today's appointments", 'Patient summary'],
    },
  },
  {
    keywords: ['summary', 'roster', 'patient summary', 'active'],
    role: 'doctor',
    response: {
      text: 'Active clinical roster: 28 antenatal mothers, 12 postpartum mothers, and 15 newborns registered under your clinical care at Sunrise Women & Children Hospital.',
      suggestedFollowUps: ["Today's appointments", 'Messages'],
    },
  },
  {
    keywords: ['message', 'inbox', 'consultation'],
    role: 'doctor',
    response: {
      text: 'You have 2 unread beneficiary consultation queries regarding postnatal care and vaccination dates.',
      suggestedFollowUps: ["Today's appointments", 'Patient summary'],
    },
  },

  // HOSPITAL SCENARIOS
  {
    keywords: ['today', 'overview', 'bed', 'facility', 'capacity'],
    role: 'hospital',
    response: {
      text: `${mockHospital.name} Overview: Bed occupancy: 82/120 beds. 4 institutional deliveries logged in the past 24 hours. Neonatal ICU operating with available capacity.`,
      suggestedFollowUps: ['Vaccinations due', 'Pending follow-ups'],
    },
  },
  {
    keywords: ['vaccin', 'immuniz', 'due', 'monitoring', 'milestone'],
    role: 'hospital',
    response: {
      text: 'There are beneficiaries with upcoming immunization milestones. Open Vaccination Monitoring to review them.',
      suggestedFollowUps: ["Today's overview", 'Pending follow-ups'],
    },
  },
  {
    keywords: ['follow-up', 'pending', 'cases', 'outreach'],
    role: 'hospital',
    response: {
      text: '6 postpartum discharge follow-ups are pending outreach verification for this week. Community healthcare workers have been assigned.',
      suggestedFollowUps: ["Today's overview", 'Beneficiary summary'],
    },
  },
  {
    keywords: ['beneficiary', 'statistics', 'summary', 'mothers'],
    role: 'hospital',
    response: {
      text: 'Total active facility beneficiaries: 142 mothers and 98 infants registered at Sunrise Women & Children Hospital.',
      suggestedFollowUps: ["Today's overview", 'Announcements'],
    },
  },
  {
    keywords: ['announcement', 'drive', 'pulse polio', 'campaign'],
    role: 'hospital',
    response: {
      text: 'Next UIP Pulse Polio drive is scheduled for next month. Facility cold chain storage verification completed successfully.',
      suggestedFollowUps: ["Today's overview", 'Vaccinations due'],
    },
  },

  // ADMIN SCENARIOS
  {
    keywords: ['system', 'overview', 'health', 'platform'],
    role: 'admin',
    response: {
      text: 'MaaSuraksha currently has active beneficiary, doctor, and hospital workspaces configured in the system.',
      suggestedFollowUps: ['Beneficiary statistics', 'Vaccination statistics'],
    },
  },
  {
    keywords: ['beneficiary', 'stats', 'statistics', 'enrollment'],
    role: 'admin',
    response: {
      text: 'Statewide enrollment: 12,450 beneficiaries tracked across 48 healthcare facilities. Active tracking rate: 98.4%.',
      suggestedFollowUps: ['Hospital activity', 'Doctor activity'],
    },
  },
  {
    keywords: ['hospital', 'activity', 'facilities'],
    role: 'admin',
    response: {
      text: '18 registered institutional maternity centers with an average 94% timely vaccination reporting rate.',
      suggestedFollowUps: ['Doctor activity', 'System overview'],
    },
  },
  {
    keywords: ['doctor', 'activity', 'officers', 'clinicians'],
    role: 'admin',
    response: {
      text: '142 active medical officers and gynecologists logged in across district centers this month.',
      suggestedFollowUps: ['Hospital activity', 'Vaccination statistics'],
    },
  },
  {
    keywords: ['vaccin', 'immuniz', 'coverage', 'uip'],
    role: 'admin',
    response: {
      text: 'UIP coverage rate is currently at 96.2% for birth dose and 91.8% for primary infant series across registered districts.',
      suggestedFollowUps: ['System overview', 'Beneficiary statistics'],
    },
  },
];
