// Level Up Planner: Authentication Context (Phase 4.3)
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import * as Linking from 'expo-linking';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as authService from '../services/authService';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (val: boolean) => void;
  authError: string | null;
  clearAuthError: () => void;

  signUp: (
    email: string,
    password: string,
    displayName?: string,
    customRedirectUrl?: string
  ) => Promise<authService.SignUpResult>;
  signIn: (email: string, password: string) => Promise<authService.AuthResult<Session>>;
  signOut: () => Promise<authService.AuthResult<void>>;
  resetPasswordForEmail: (email: string) => Promise<authService.AuthResult<void>>;
  updatePassword: (newPassword: string) => Promise<authService.AuthResult<User>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Handle incoming deep links (e.g. Password Recovery or Email Confirmation)
  const handleDeepLink = useCallback(async (url: string | null) => {
    if (!url) return;

    // Detect if this is a password recovery link
    if (url.includes('reset-password') || url.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }

    // Parse parameters from either hash (#) or query string (?)
    let rawParams = '';
    if (url.includes('#')) {
      rawParams = url.substring(url.indexOf('#') + 1);
    } else if (url.includes('?')) {
      rawParams = url.substring(url.indexOf('?') + 1);
    }

    if (rawParams) {
      const params = new URLSearchParams(rawParams);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      const code = params.get('code');
      const errorDescription = params.get('error_description');
      const errorMsg = params.get('error');

      if (type === 'recovery') {
        setIsPasswordRecovery(true);
      }

      if (errorDescription || errorMsg) {
        const readableError = errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Authentication link is invalid or has expired.';
        setAuthError(readableError);
        return;
      }

      if (accessToken && refreshToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setAuthError(authService.formatAuthError(error));
          } else if (data.session) {
            setSession(data.session);
          }
        } catch (e) {
          console.warn('Failed to set session from deep link:', e);
        }
      } else if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setAuthError(authService.formatAuthError(error));
          } else if (data.session) {
            setSession(data.session);
          }
        } catch (e) {
          console.warn('Failed to exchange code for session from deep link:', e);
        }
      }
    }
  }, []);

  // Initialize Session on App Startup & Listen to Auth Changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const initialSession = await authService.getSession();
        if (isMounted) {
          setSession(initialSession);
        }

        // Check for initial URL if app was launched via deep link
        const initialUrl = await Linking.getInitialURL();
        await handleDeepLink(initialUrl);
      } catch (err) {
        console.warn('Failed to retrieve initial auth session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Deep Link event subscription
    const linkSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Supabase auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        setIsLoading(false);

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
        }
      }
    );

    return () => {
      isMounted = false;
      linkSubscription.remove();
      authListener?.subscription.unsubscribe();
    };
  }, [handleDeepLink]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string,
      customRedirectUrl?: string
    ) => {
      clearAuthError();
      const res = await authService.signUp(
        email,
        password,
        displayName,
        customRedirectUrl
      );
      if (res.error) {
        setAuthError(res.error);
      }
      return res;
    },
    [clearAuthError]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      clearAuthError();
      const res = await authService.signIn(email, password);
      if (res.error) {
        setAuthError(res.error);
      }
      return res;
    },
    [clearAuthError]
  );

  const signOut = useCallback(async () => {
    clearAuthError();
    const res = await authService.signOut();
    if (res.error) {
      setAuthError(res.error);
    } else {
      setSession(null);
    }
    return res;
  }, [clearAuthError]);

  const resetPasswordForEmail = useCallback(
    async (email: string) => {
      clearAuthError();
      const res = await authService.resetPasswordForEmail(email);
      if (res.error) {
        setAuthError(res.error);
      }
      return res;
    },
    [clearAuthError]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      clearAuthError();
      const res = await authService.updatePassword(newPassword);
      if (res.error) {
        setAuthError(res.error);
      } else {
        setIsPasswordRecovery(false);
      }
      return res;
    },
    [clearAuthError]
  );

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      isPasswordRecovery,
      setIsPasswordRecovery,
      authError,
      clearAuthError,
      signUp,
      signIn,
      signOut,
      resetPasswordForEmail,
      updatePassword,
    }),
    [
      session,
      isLoading,
      isPasswordRecovery,
      authError,
      clearAuthError,
      signUp,
      signIn,
      signOut,
      resetPasswordForEmail,
      updatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
