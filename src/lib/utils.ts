import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random string for IDs, tokens, etc.
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a username from email address
 */
export function generateUsername(email: string): string {
  const base = email.split('@')[0];
  const clean = base.replace(/[^a-zA-Z0-9]/g, '');
  const random = Math.floor(Math.random() * 1000);
  return `${clean}${random}`;
}

/**
 * Generate a username (AI placeholder - will use AI in future)
 */
export async function generateUsernameWithAI(email: string): Promise<string> {
  // Placeholder: same as generateUsername for now. Will integrate AI later.
  await new Promise((r) => setTimeout(r, 200));
  return generateUsername(email);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  {
    id: 'special',
    label: 'One special character',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
] as const;

export type PasswordRequirementStatus = {
  id: (typeof PASSWORD_REQUIREMENTS)[number]['id'];
  label: string;
  met: boolean;
};

/**
 * Check password strength
 */
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  requirements: PasswordRequirementStatus[];
} {
  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    id: req.id,
    label: req.label,
    met: req.test(password),
  }));

  const feedback = requirements.filter((r) => !r.met).map((r) => r.label);
  const score = requirements.filter((r) => r.met).length;

  return { score, feedback, requirements };
}

export function passwordStrengthLabel(score: number): string {
  if (score <= 2) return 'Weak';
  if (score <= 3) return 'Fair';
  if (score <= 4) return 'Good';
  return 'Strong';
}

export function passwordStrengthColor(score: number): string {
  if (score <= 2) return 'var(--inkblot-semantic-color-status-error)';
  if (score <= 3) return 'var(--inkblot-semantic-color-status-warning)';
  return 'var(--inkblot-semantic-color-status-success)';
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get theme from localStorage or system preference
 */
export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  // Auth portal uses light theme by default; user can toggle if desired
  const saved = localStorage.getItem('inkid-theme') as 'light' | 'dark';
  if (saved) return saved;
  return 'light';
}

/**
 * Set theme in localStorage and update document
 */
export function setTheme(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('inkid-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
} 