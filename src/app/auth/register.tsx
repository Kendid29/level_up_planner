// Level Up Planner: Sign Up Screen (Phase 4.3)
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
import { Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { validateEmail, validatePassword } from '@/services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, authError, clearAuthError } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [isSuccessConfirmation, setIsSuccessConfirmation] = useState(false);

  const passwordValidation = validatePassword(password);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter a password.';
    } else if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearAuthError();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await signUp(email.trim(), password, displayName.trim());

      if (res.error) {
        return;
      }

      if (res.needsEmailConfirmation) {
        setIsSuccessConfirmation(true);
      } else {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccessConfirmation) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }]}>
        <ScreenHeader
          title="Verify Your Email"
          subtitle="One last step to activate your cloud account"
        />
        <ScrollView contentContainerStyle={styles.successContainer}>
          <Card style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <Mail size={40} color={colors.forest} strokeWidth={2} />
            </View>
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successBody}>
              We have sent a confirmation link to:
            </Text>
            <Text style={styles.successEmail}>{email.trim()}</Text>
            <Text style={styles.successDescription}>
              Please tap the link inside the email to verify your address. Once verified, you can sign in to your cloud account.
            </Text>

            <Button
              title="Proceed to Sign In"
              onPress={() => router.replace('/auth/login' as any)}
              style={styles.successButton}
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader
          title="Create Account"
          subtitle="Enable secure cloud backup for Level Up Planner"
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

          <Card style={styles.formCard}>
            <View style={styles.inputWrapper}>
              <Input
                label="Display Name (Optional)"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="What should we call you?"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (localErrors.email) setLocalErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={localErrors.email}
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.passwordContainer}>
                <Input
                  label="Password"
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

              {/* Password Strength Checklist */}
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

                  <View style={styles.criteriaRow}>
                    <CheckCircle2
                      size={14}
                      color={password.length >= 8 ? colors.forest : colors.muted}
                    />
                    <Text
                      style={[
                        styles.criteriaText,
                        password.length >= 8 && styles.criteriaMet,
                      ]}
                    >
                      At least 8 characters
                    </Text>
                  </View>

                  <View style={styles.criteriaRow}>
                    <CheckCircle2
                      size={14}
                      color={/[a-zA-Z]/.test(password) ? colors.forest : colors.muted}
                    />
                    <Text
                      style={[
                        styles.criteriaText,
                        /[a-zA-Z]/.test(password) && styles.criteriaMet,
                      ]}
                    >
                      Includes at least one letter
                    </Text>
                  </View>

                  <View style={styles.criteriaRow}>
                    <CheckCircle2
                      size={14}
                      color={
                        /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
                          ? colors.forest
                          : colors.muted
                      }
                    />
                    <Text
                      style={[
                        styles.criteriaText,
                        /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) &&
                          styles.criteriaMet,
                      ]}
                    >
                      Includes at least one number or symbol
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.passwordContainer}>
                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (localErrors.confirmPassword) {
                      setLocalErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  placeholder="Re-enter your password"
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
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.actionButton}
            />
          </Card>

          {/* Navigation to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Already have an account?</Text>
            <Pressable
              onPress={() => router.push('/auth/login' as any)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Sign in to existing account"
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
    marginBottom: spacing.xs,
  },
  strengthLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  strengthValue: {
    ...typography.caption,
    fontWeight: '700',
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  criteriaText: {
    ...typography.caption,
    color: colors.muted,
  },
  criteriaMet: {
    color: colors.forest,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: spacing.md,
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
  successContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  successCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  },
  successEmail: {
    ...typography.body,
    fontWeight: '700',
    color: colors.forest,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  successDescription: {
    ...typography.bodySmall,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  successButton: {
    width: '100%',
  },
});
