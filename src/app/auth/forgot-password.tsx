// Level Up Planner: Forgot Password Screen (Phase 4.3)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { validateEmail } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPasswordForEmail, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendReset = async () => {
    clearAuthError();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setLocalError('Please enter your account email.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setLocalError(null);
    setIsLoading(true);
    try {
      const res = await resetPasswordForEmail(cleanEmail);
      if (!res.error) {
        setIsSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader
          title="Reset Password"
          subtitle="We will send you a recovery link"
          showBack
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/auth/login' as any);
            }
          }}
        />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {authError ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <AlertCircle size={20} color={colors.error} strokeWidth={2} />
              <Text style={styles.errorBannerText}>{authError}</Text>
            </View>
          ) : null}

          {isSuccess ? (
            <Card style={styles.successCard}>
              <View style={styles.iconCircle}>
                <CheckCircle2 size={36} color={colors.forest} strokeWidth={2} />
              </View>
              <Text style={styles.successTitle}>Check Your Inbox</Text>
              <Text style={styles.successText}>
                If an account exists with <Text style={styles.emailHighlight}>{email.trim()}</Text>, we have sent a password reset link.
              </Text>
              <Text style={styles.instructionText}>
                Open the link on your mobile device to set a new password. If you don't see it, check your spam folder.
              </Text>

              <Button
                title="Back to Sign In"
                onPress={() => router.replace('/auth/login' as any)}
                style={styles.actionButton}
              />
            </Card>
          ) : (
            <Card style={styles.formCard}>
              <Text style={styles.description}>
                Enter the email address associated with your account. We will send a secure link to reset your password.
              </Text>

              <View style={styles.inputWrapper}>
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (localError) setLocalError(null);
                  }}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={localError}
                />
              </View>

              <Button
                title="Send Recovery Link"
                onPress={handleSendReset}
                loading={isLoading}
                disabled={isLoading}
                style={styles.actionButton}
              />
            </Card>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Remembered your password?</Text>
            <Pressable
              onPress={() => router.replace('/auth/login' as any)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#F8B4B4',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorBannerText: {
    ...typography.bodySmall,
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.error,
  },
  formCard: {
    padding: spacing.lg,
    backgroundColor: colors.paper,
  },
  description: {
    ...typography.bodySmall,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
  successCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.paleSage,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  successText: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: '700',
    color: colors.forest,
  },
  instructionText: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  footerPrompt: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  footerLink: {
    ...typography.bodySmall,
    color: colors.forest,
    fontWeight: '600',
  },
});
