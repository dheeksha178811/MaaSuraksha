import {
  AssistantContext,
  AssistantMessage,
  AssistantQuickAction,
  AssistantResponse,
  UserRole
} from '@/types';
import {
  ROLE_GREETINGS,
  QUICK_ACTIONS_BY_ROLE,
  MOCK_RESPONSES
} from '@/data/assistantMockData';

/**
 * Generates the initial role-aware greeting message.
 */
export function getInitialGreeting(context: AssistantContext): AssistantMessage {
  const role = context.role || 'mother';
  const greetingConfig = ROLE_GREETINGS[role] || ROLE_GREETINGS.mother;

  return {
    id: `msg_init_${Date.now()}`,
    sender: 'assistant',
    text: greetingConfig.initialMessage,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category: 'general',
  };
}

/**
 * Returns role-specific suggested quick-action chips.
 */
export function getQuickActionsForRole(role: UserRole): AssistantQuickAction[] {
  return QUICK_ACTIONS_BY_ROLE[role] || QUICK_ACTIONS_BY_ROLE.mother;
}

/**
 * Finds the best-matching mock assistant response based on user query and active role context.
 */
function findMatchingResponse(query: string, context: AssistantContext): AssistantResponse {
  const normalized = query.toLowerCase().trim();
  const currentRole = context.role || 'mother';

  // 1. Check for medical safety / emergency keywords first (applies globally)
  const safetyMatch = MOCK_RESPONSES.find(
    (item) => !item.role && item.keywords.some((kw) => normalized.includes(kw))
  );
  if (safetyMatch) {
    return safetyMatch.response;
  }

  // 2. Check for role-specific matches
  const roleMatches = MOCK_RESPONSES.filter((item) => item.role === currentRole);
  for (const item of roleMatches) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.response;
    }
  }

  // 3. Check for general matches
  const generalMatches = MOCK_RESPONSES.filter((item) => !item.role);
  for (const item of generalMatches) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.response;
    }
  }

  // 4. Contextual Fallback Response
  if (currentRole === 'mother') {
    return {
      text: "I can help you with immunization schedules, checkup appointments, doctor information, nutrition guides, and maternal government schemes. Try clicking one of the suggested actions above or ask about your baby's upcoming vaccination.",
      actions: [
        { label: 'View Vaccinations', href: '/mother/vaccinations', variant: 'primary' },
        { label: 'View Appointments', href: '/mother/appointments', variant: 'secondary' },
      ],
      suggestedFollowUps: ["When is my child's next vaccination?", 'What do I have coming up?'],
    };
  }

  if (currentRole === 'doctor') {
    return {
      text: "As your clinical assistant, I can display today's appointment load, follow-up alerts, and immunization tracking across your patient roster.",
      suggestedFollowUps: ["Today's appointments", 'Patients needing follow-up'],
    };
  }

  if (currentRole === 'hospital') {
    return {
      text: "Facility assistant is ready to help coordinate bed status, vaccination distribution, and maternal outreach monitoring.",
      suggestedFollowUps: ["Today's overview", 'Vaccinations due'],
    };
  }

  return {
    text: "MaaSuraksha administrative overview supports tracking beneficiary registries, hospital performance, and state-wide immunization coverage.",
    suggestedFollowUps: ['System overview', 'Beneficiary statistics'],
  };
}

/**
 * Main entry point for getting an assistant response.
 * Simulates async response handling for future API / backend readiness.
 */
export async function getAssistantResponse(
  query: string,
  context: AssistantContext
): Promise<AssistantResponse> {
  // Simulate natural brief latency (350ms)
  await new Promise((resolve) => setTimeout(resolve, 350));
  return findMatchingResponse(query, context);
}
