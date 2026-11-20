// Level Up Planner: Supabase Authentication Service (Phase 4.3)
import * as Linking from 'expo-linking';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: 'weak' | 'medium' | 'strong';
}

export interface AuthResult<T = void> {
  data: T | null;
  error: string | null;
}

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  needsEmailConfirmation: boolean;
  error: string | null;
}

/**
 * Validates standard email address syntax.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Evaluates password strength and returns structured feedback.
 * Requirements:
 * - At least 8 characters
 * - At least one letter
 * - At least one digit or symbol
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  if (!hasLetter) {
    errors.push('Password must include at least one letter.');
  }

  const hasDigitOrSymbol = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (!hasDigitOrSymbol) {
    errors.push('Password must include at least one number or symbol.');
  }

  let score: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    const isLong = password.length >= 10;
    const hasBothDigitAndSymbol = /\d/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

    if (isLong && (hasBothDigitAndSymbol || (hasMixedCase && hasDigitOrSymbol))) {
      score = 'strong';
    } else {
      score = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
}

/**
 * Formats Supabase Auth errors into clear, friendly messages for users.
 */
export function formatAuthError(error: AuthError | Error | null | unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  let message = '';
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    message = String((error as Record<string, unknown>).message);
  } else {
    message = String(error);
  }

  if (/user already registered/i.test(message) || /already exists/i.test(message)) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (/invalid login credentials/i.test(message) || /invalid credentials/i.test(message)) {
    return 'Incorrect email or password. Please double check and try again.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Your email has not been confirmed yet. Please check your inbox for the verification link.';
  }
  if (/rate limit/i.test(message) || /too many requests/i.test(message)) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (/network/i.test(message) || /failed to fetch/i.test(message)) {
    return 'Network error. Please check your internet connection.';
  }
  if (/password/i.test(message) && /should be at least/i.test(message)) {
    return 'Password is too short. It must be at least 8 characters long.';
  }
  if (/expired/i.test(message)) {
    return 'The link or session has expired. Please request a new one.';
  }

  return message;
}

/**
 * Registers a new user with email, password, and optional display name.
 * Generates an email confirmation redirect URL compatible with Expo Go and standalone builds.
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string,
  customRedirectUrl?: string
): Promise<SignUpResult> {
  const cleanEmail = email.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return {
      user: null,
      session: null,
      needsEmailConfirmation: false,
      error: 'Please enter a valid email address.',
    };
  }

  const passwordVal = validatePassword(password);
  if (!passwordVal.isValid) {
    return {
      user: null,
      session: null,
      needsEmailConfirmation: false,
      error: passwordVal.errors[0],
    };
  }

  try {
    const emailRedirectTo =
      customRedirectUrl || Linking.createURL('auth/callback');

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          display_name: displayName?.trim() || 'Planner User',
        },
      },
    });

    if (error) {
      return {
        user: null,
        session: null,
        needsEmailConfirmation: false,
        error: formatAuthError(error),
      };
    }

    // In Supabase Auth: If email confirmation is enabled, user is returned but session is null.
    // If confirmation is disabled, both user and session are returned.
    const needsEmailConfirmation = Boolean(data.user && !data.session);

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      session: null,
      needsEmailConfirmation: false,
      error: formatAuthError(err),
    };
  }
}

/**
 * Signs in an existing user with email and password.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<Session>> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return { data: null, error: 'Please enter both email and password.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { data: null, error: formatAuthError(error) };
    }

    return { data: data.session, error: null };
  } catch (err) {
    return { data: null, error: formatAuthError(err) };
  }
}

/**
 * Signs out the currently authenticated user.
 * Destroys the persistent session without modifying local SQLite planner data.
 */
export async function signOut(): Promise<AuthResult<void>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { data: null, error: formatAuthError(error) };
    }
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: formatAuthError(err) };
  }
}

/**
 * Sends a password reset email with a deep link back to the app.
 */
export async function resetPasswordForEmail(
  email: string,
  customRedirectUrl?: string
): Promise<AuthResult<void>> {
  const cleanEmail = email.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { data: null, error: 'Please enter a valid email address.' };
  }

  try {
    const redirectUrl =
      customRedirectUrl || Linking.createURL('auth/reset-password');

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { data: null, error: formatAuthError(error) };
    }

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: formatAuthError(err) };
  }
}

/**
 * Updates the user's password once in an active session (e.g. from recovery link).
 */
export async function updatePassword(newPassword: string): Promise<AuthResult<User>> {
  const passwordVal = validatePassword(newPassword);
  if (!passwordVal.isValid) {
    return { data: null, error: passwordVal.errors[0] };
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { data: null, error: formatAuthError(error) };
    }

    return { data: data.user, error: null };
  } catch (err) {
    return { data: null, error: formatAuthError(err) };
  }
}

/**
 * Retrieves the current session from storage.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Retrieves the currently authenticated user.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
