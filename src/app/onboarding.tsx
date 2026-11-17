// Level Up Planner: Welcome & Onboarding Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Check, ArrowRight } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';

const FOCUS_AREAS = [
  'Personal Growth',
  'Health & Wellness',
  'Career',
  'Education',
  'Finance',
  'Relationships',
  'Lifestyle',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'Personal Growth',
    'Health & Wellness',
  ]);
  const [isFinishing, setIsFinishing] = useState(false);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await updateProfile({
        display_name: name.trim() || 'Planner User',
        onboarding_completed: 1,
      });
      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
      router.replace('/(tabs)');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSkip = async () => {
    await updateProfile({
      onboarding_completed: 1,
    });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.topBar}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {step} of 2</Text>
        </View>
        <Button
          title="Skip"
          variant="ghost"
          onPress={handleSkip}
          style={styles.skipBtn}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <View style={styles.stepContainer}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandName}>LEVEL UP PLANNER</Text>
            </View>

            <Text style={styles.heroTitle}>A calm space to plan your next level</Text>
            <Text style={styles.heroSubtitle}>
              Connect your big ambitions to clear milestones, daily tasks, and grounding routines.
            </Text>

            <View style={styles.inputSection}>
              <Input
                label="What should we call you?"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            <Button
              title="Continue"
              variant="primary"
              onPress={() => setStep(2)}
              leftIcon={<ArrowRight size={16} color={colors.white} />}
              style={styles.mainBtn}
            />
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text style={styles.heroTitle}>Choose your growth areas</Text>
            <Text style={styles.heroSubtitle}>
              Select the parts of life you want to nurture. You can change these anytime.
            </Text>

            <View style={styles.areasRow}>
              {FOCUS_AREAS.map((area) => {
                const isSelected = selectedAreas.includes(area);
                return (
                  <Chip
                    key={area}
                    label={area}
                    selected={isSelected}
                    onPress={() => toggleArea(area)}
                    style={styles.areaChip}
                  />
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <Button
                title="Back"
                variant="secondary"
                onPress={() => setStep(1)}
                style={styles.buttonFlex}
              />
              <Button
                title="Get Started"
                variant="primary"
                onPress={handleFinish}
                loading={isFinishing}
                style={styles.buttonFlex}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  stepIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.paleSage,
  },
  stepText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.forest,
  },
  skipBtn: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing['3xl'],
  },
  stepContainer: {
    paddingVertical: spacing.xl,
  },
  brandBadge: {
    marginBottom: spacing.md,
  },
  brandName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.forest,
    letterSpacing: 1.5,
  },
  heroTitle: {
    ...typography.display,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  mainBtn: {
    marginTop: spacing.md,
  },
  areasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  areaChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonFlex: {
    flex: 1,
  },
});
