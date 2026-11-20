// Level Up Planner: Update Password Screen (Phase 4.3)
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
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { validatePassword } from '@/services/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, updatePassword, isPasswordRecovery, authError, clearAuthError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // If user is not authenticated and not in a recovery session, the link is invalid or expired
  const isSessionValid = Boolean(session || isPasswordRecovery);

  const passwordValidation = validatePassword(password);

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = 'Please enter a new password.';
    } else if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async () => {
    clearAuthError();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await updatePassword(password);
      if (!res.error && res.data) {
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
          title="Set New Password"
          subtitle="Choose a secure password for your account"
          showBack
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
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

          {!isSessionValid ? (
            <Card style={styles.errorCard}>
              <View style={styles.errorIconCircle}>
                <AlertCircle size={36} color={colors.error} strokeWidth={2} />
              </View>
              <Text style={styles.errorTitle}>Invalid or Expired Link</Text>
              <Text style={styles.errorBody}>
                This password reset link has expired or has already been used. Please request a new recovery link.
              </Text>
              <Button
                title="Request New Link"
                onPress={() => router.replace('/auth/forgot-password' as any)}
                style={styles.actionButton}
              />
            </Card>
          ) : isSuccess ? (
            <Card style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={36} color={colors.forest} strokeWidth={2} />
              </View>
              <Text style={styles.successTitle}>Password Updated</Text>
              <Text style={styles.successBody}>
                Your password has been changed successfully. You can now use your new password to sign in.
              </Text>
              <Button
                title="Back to App"
                onPress={() => router.replace('/(tabs)')}
                style={styles.actionButton}
              />
            </Card>
          ) : (
            <Card style={styles.formCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.passwordContainer}>
                  <Input
                    label="New Password"
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (localErrors.password) setLocalErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="At least 8 characters"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={localErrors.password}
                    containerStyle={{ flex: 1 }}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.muted} />
                    ) : (
                      <Eye size={20} color={colors.muted} />
                    )}
                  </Pressable>
                </View>

                {password.length > 0 ? (
                  <View style={styles.strengthBox}>
                    <View style={styles.strengthHeader}>
                      <Text style={styles.strengthLabel}>Password Strength: </Text>
                      <Text
                        style={[
                          styles.strengthValue,
                          passwordValidation.score === 'strong'
                            ? { color: colors.forest }
                            : passwordValidation.score === 'medium'
                            ? { color: colors.warning }
                            : { color: colors.error },
                        ]}
                      >
                        {passwordValidation.score.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.passwordContainer}>
                  <Input
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (localErrors.confirmPassword) {
                        setLocalErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    placeholder="Re-enter your new password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={localErrors.confirmPassword}
                    containerStyle={{ flex: 1 }}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    hitSlop={8}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.muted} />
                    ) : (
                      <Eye size={20} color={colors.muted} />
                    )}
                  </Pressable>
                </View>
              </View>

              <Button
                title="Update Password"
                onPress={handleUpdatePassword}
                loading={isLoading}
                disabled={isLoading}
                style={styles.actionButton}
              />
            </Card>
          )}
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
  inputWrapper: {
    marginBottom: spacing.sm,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 36,
    padding: spacing.xs,
  },
  strengthBox: {
    backgroundColor: colors.cream,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  strengthHeader: {
    flexDirection: 'row',
  },
  strengthLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  strengthValue: {
    ...typography.caption,
    fontWeight: '700',
  },
  actionButton: {
    marginTop: spacing.md,
  },
  successCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  successIconCircle: {
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
  successBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  errorCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
});
