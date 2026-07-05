import { createContext, useContext } from 'react';
import type { MascotMood } from './CitronMascot';

export interface AuthExperienceContextValue {
  registerMascotSlot: (el: HTMLElement | null) => void;
  mood: MascotMood;
  attentive: boolean;
  eyesClosed: boolean;
  covering: boolean;
  celebrating: boolean;
}

export const AuthExperienceContext = createContext<AuthExperienceContextValue | null>(null);

export function useAuthExperience(): AuthExperienceContextValue {
  const ctx = useContext(AuthExperienceContext);
  if (!ctx) {
    throw new Error('useAuthExperience must be used within AuthExperienceShell');
  }
  return ctx;
}
