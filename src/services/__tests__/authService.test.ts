// Level Up Planner: Phase 4.3 Authentication Service Tests
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock expo-linking before authService is imported
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `levelup://${path}`),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialURL: jest.fn(async () => null),
}));

// Mock Supabase Auth methods
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

import {
  validateEmail,
  validatePassword,
  formatAuthError,
  signUp,
  signIn,
  signOut,
  resetPasswordForEmail,
  updatePassword,
} from '../authService';
import { supabase } from '../../lib/supabase';

describe('Auth Service — Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('john.doe@company.co.id')).toBe(true);
      expect(validateEmail('test+alias@domain.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@missinguser.com')).toBe(false);
      expect(validateEmail('user@missingdomain')).toBe(false);
      expect(validateEmail('user with spaces@domain.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('rejects passwords shorter than 8 characters', () => {
      const res = validatePassword('Short1!');
      expect(res.isValid).toBe(false);
      expect(res.errors).toContain('Password must be at least 8 characters long.');
      expect(res.score).toBe('weak');
    });

    it('rejects passwords without letters', () => {
      const res = validatePassword('123456789!');
      expect(res.isValid).toBe(false);
      expect(res.errors).toContain('Password must include at least one letter.');
    });

    it('rejects passwords without digits or symbols', () => {
      const res = validatePassword('abcdefghij');
      expect(res.isValid).toBe(false);
      expect(res.errors).toContain('Password must include at least one number or symbol.');
    });

    it('accepts medium passwords meeting minimum criteria', () => {
      const res = validatePassword('password123');
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(res.score).toBe('medium');
    });

    it('rates strong passwords with mixed case, digits, and symbols', () => {
      const res = validatePassword('LevelUp#2026!');
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(res.score).toBe('strong');
    });
  });

  describe('formatAuthError', () => {
    it('maps duplicate email error cleanly', () => {
      const err = new Error('User already registered');
      expect(formatAuthError(err)).toBe('An account with this email already exists. Please sign in instead.');
    });

    it('maps invalid credentials cleanly', () => {
      const err = new Error('Invalid login credentials');
      expect(formatAuthError(err)).toBe('Incorrect email or password. Please double check and try again.');
    });

    it('maps unconfirmed email cleanly', () => {
      const err = new Error('Email not confirmed');
      expect(formatAuthError(err)).toBe('Your email has not been confirmed yet. Please check your inbox for the verification link.');
    });

    it('maps rate limit errors cleanly', () => {
      const err = new Error('Too many requests, rate limit exceeded');
      expect(formatAuthError(err)).toBe('Too many attempts. Please wait a few minutes before trying again.');
    });

    it('maps network errors cleanly', () => {
      const err = new Error('Failed to fetch network');
      expect(formatAuthError(err)).toBe('Network error. Please check your internet connection.');
    });
  });

  describe('signUp', () => {
    it('rejects invalid email before calling Supabase', async () => {
      const res = await signUp('not-an-email', 'ValidPass123!');
      expect(res.error).toBe('Please enter a valid email address.');
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('rejects weak password before calling Supabase', async () => {
      const res = await signUp('valid@example.com', 'short');
      expect(res.error).toBe('Password must be at least 8 characters long.');
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('handles successful registration with email confirmation required', async () => {
      (supabase.auth.signUp as unknown as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
          session: null,
        },
        error: null,
      } as never);

      const res = await signUp('test@example.com', 'SecurePass123!', 'John Planner');
      expect(res.error).toBeNull();
      expect(res.user?.id).toBe('user_123');
      expect(res.session).toBeNull();
      expect(res.needsEmailConfirmation).toBe(true);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!',
        options: {
          emailRedirectTo: 'levelup://auth/callback',
          data: { display_name: 'John Planner' },
        },
      });
    });

    it('supports custom emailRedirectTo when provided', async () => {
      (supabase.auth.signUp as unknown as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: 'user_456', email: 'custom@example.com' },
          session: null,
        },
        error: null,
      } as never);

      await signUp('custom@example.com', 'SecurePass123!', 'Custom User', 'https://example.com/custom-confirm');
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'custom@example.com',
        password: 'SecurePass123!',
        options: {
          emailRedirectTo: 'https://example.com/custom-confirm',
          data: { display_name: 'Custom User' },
        },
      });
    });

    it('handles duplicate user registration error', async () => {
      (supabase.auth.signUp as unknown as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      } as never);

      const res = await signUp('existing@example.com', 'SecurePass123!');
      expect(res.error).toBe('An account with this email already exists. Please sign in instead.');
    });
  });

  describe('signIn', () => {
    it('validates empty inputs', async () => {
      const res = await signIn('', '');
      expect(res.error).toBe('Please enter both email and password.');
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('handles successful login', async () => {
      const mockSession = { access_token: 'jwt_token_abc', user: { id: 'user_123' } };
      (supabase.auth.signInWithPassword as unknown as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as never);

      const res = await signIn('user@example.com', 'ValidPass123!');
      expect(res.error).toBeNull();
      expect(res.data).toEqual(mockSession);
    });

    it('handles wrong password / invalid credentials', async () => {
      (supabase.auth.signInWithPassword as unknown as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Invalid login credentials' },
      } as never);

      const res = await signIn('user@example.com', 'WrongPass!');
      expect(res.error).toBe('Incorrect email or password. Please double check and try again.');
    });

    it('handles email not confirmed error', async () => {
      (supabase.auth.signInWithPassword as unknown as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Email not confirmed' },
      } as never);

      const res = await signIn('unconfirmed@example.com', 'Pass12345!');
      expect(res.error).toBe('Your email has not been confirmed yet. Please check your inbox for the verification link.');
    });
  });

  describe('signOut', () => {
    it('signs out user cleanly', async () => {
      (supabase.auth.signOut as unknown as jest.Mock).mockResolvedValueOnce({ error: null } as never);

      const res = await signOut();
      expect(res.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('handles sign out failure', async () => {
      (supabase.auth.signOut as unknown as jest.Mock).mockResolvedValueOnce({
        error: new Error('Network error'),
      } as never);

      const res = await signOut();
      expect(res.error).toBe('Network error. Please check your internet connection.');
    });
  });

  describe('resetPasswordForEmail', () => {
    it('validates email format', async () => {
      const res = await resetPasswordForEmail('bad-email');
      expect(res.error).toBe('Please enter a valid email address.');
      expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    });

    it('sends password reset link with redirect url', async () => {
      (supabase.auth.resetPasswordForEmail as unknown as jest.Mock).mockResolvedValueOnce({ error: null } as never);

      const res = await resetPasswordForEmail('user@example.com');
      expect(res.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.objectContaining({ redirectTo: expect.any(String) })
      );
    });
  });

  describe('updatePassword', () => {
    it('rejects weak new password', async () => {
      const res = await updatePassword('weak');
      expect(res.error).toBe('Password must be at least 8 characters long.');
      expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    });

    it('updates password when requirements are met', async () => {
      (supabase.auth.updateUser as unknown as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: 'user_123' } },
        error: null,
      } as never);

      const res = await updatePassword('BrandNewPassword#2026');
      expect(res.error).toBeNull();
      expect(res.data).toEqual({ id: 'user_123' });
    });
  });
});
