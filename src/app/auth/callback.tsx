// Level Up Planner: Auth Callback Route (Phase 4.3)
// Handles incoming email confirmation and authentication redirect links
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, isAuthenticated, isPasswordRecovery, authError } = useAuth();
  const params = useLocalSearchParams<{
    error?: string;
    error_description?: string;
    type?: string;
    code?: string;
  }>();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If this is a password recovery link, route directly to the reset-password screen
    if (params.type === 'recovery' || isPasswordRecovery) {
      router.replace('/auth/reset-password' as any);
      return;
    }

    // Check for explicit error passed in URL parameters
    if (params.error || params.error_description) {
      setStatus('error');
      const desc = params.error_description
        ? decodeURIComponent(params.error_description.replace(/\+/g, ' '))
        : 'This verification link is invalid or has expired.';
      setErrorMessage(desc);
      return;
    }

    if (authError) {
      setStatus('error');
      setErrorMessage(authError);
      return;
    }

    // If session is active or user is authenticated, verification succeeded
    if (isAuthenticated || session) {
      setStatus('success');
      return;
    }

    // Fallback timer: if after 4 seconds no session is confirmed and no error was reported
    const timer = setTimeout(() => {
      if (!isAuthenticated && !session) {
        setStatus('error');
        setErrorMessage(
          'Verification timed out or the link was already used. Please try signing in.'
        );
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [params, isAuthenticated, session, isPasswordRecovery, authError, router]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Account Verification"
        subtitle="Finalizing your cloud account setup"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {status === 'verifying' && (
          <Card style={styles.card}>
            <View style={styles.iconCircle}>
              <ActivityIndicator size="large" color={colors.forest} />
            </View>
            <Text style={styles.title}>Confirming Your Account</Text>
            <Text style={styles.body}>
              Please wait while we verify your email address and activate your cloud account...
            </Text>
          </Card>
        )}

        {status === 'success' && (
          <Card style={styles.card}>
            <View style={styles.iconCircle}>
              <CheckCircle2 size={36} color={colors.forest} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Email Confirmed</Text>
            <Text style={styles.body}>
              Your account has been verified successfully. Your planner data remains completely safe on this device.
            </Text>
            <Button
              title="Continue to Planner"
              onPress={() => router.replace('/(tabs)')}
              style={styles.actionButton}
            />
          </Card>
        )}

        {status === 'error' && (
          <Card style={styles.card}>
            <View style={styles.errorIconCircle}>
              <AlertCircle size={36} color={colors.error} strokeWidth={2} />
            </View>
            <Text style={styles.errorTitle}>Verification Failed</Text>
            <Text style={styles.body}>
              {errorMessage || 'The verification link could not be validated or has expired.'}
            </Text>
            <Button
              title="Back to Sign In"
              onPress={() => router.replace('/auth/login' as any)}
              style={styles.actionButton}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    ...typography.h2,
    color: colors.forest,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodySmall,
    color: colors.charcoal,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  actionButton: {
    width: '100%',
  },
});
