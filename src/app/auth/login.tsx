// Level Up Planner: Sign In Screen (Phase 4.3)
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
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { validateEmail } from '@/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    clearAuthError();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await signIn(email.trim(), password);
      if (!res.error) {
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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader
          title="Sign In"
          subtitle="Connect Level Up Planner to Supabase Cloud"
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
                  placeholder="Enter your password"
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
            </View>

            <View style={styles.forgotRow}>
              <Pressable
                onPress={() => router.push('/auth/forgot-password' as any)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              disabled={isLoading}
              style={styles.actionButton}
            />
          </Card>

          {/* Navigation to Register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Don't have an account yet?</Text>
            <Pressable
              onPress={() => router.push('/auth/register' as any)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.footerLink}>Create Account</Text>
            </Pressable>
          </View>

          {/* Offline Mode Note */}
          <View style={styles.offlineNote}>
            <Text style={styles.offlineNoteText}>
              Your data remains saved locally on this device. Signing in connects your account to cloud backup and multi-device sync.
            </Text>
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
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.xs,
  },
  forgotText: {
    ...typography.bodySmall,
    color: colors.forest,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: spacing.xs,
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
  offlineNote: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  offlineNoteText: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },
});
