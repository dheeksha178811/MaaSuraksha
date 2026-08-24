import { useSyncExternalStore } from 'react';
import { CareStage, DEFAULT_CARE_STAGE } from '@/data/careJourneyMockData';

let currentCareStage: CareStage = DEFAULT_CARE_STAGE;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentCareStage;

export const setCareStage = (careStage: CareStage) => {
  currentCareStage = careStage;
  listeners.forEach((listener) => listener());
};

export const useCareStage = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
