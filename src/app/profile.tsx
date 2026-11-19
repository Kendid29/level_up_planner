// Level Up Planner: Profile & Settings Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Bell, Shield, Info, Trash2, ChevronRight, TrendingUp, Tag, Database } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, resetAllData } = useApp();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [weekStart, setWeekStart] = useState(profile?.week_start ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        week_start: weekStart,
      });
      setSavedMessage('Profile settings saved successfully.');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Profile & Settings"
        subtitle="Manage your planner preferences"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Section */}
        <Card style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <User size={28} color={colors.forest} strokeWidth={2} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{profile?.display_name || 'User'}</Text>
              <Text style={styles.profileRole}>Personal Life Planner</Text>
            </View>
          </View>

          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name or preferred nickname"
          />

          <Text style={styles.sectionLabel}>First Day of the Week</Text>
          <View style={styles.chipRow}>
            <Chip
              label="Monday"
              selected={weekStart === 1}
              onPress={() => setWeekStart(1)}
            />
            <Chip
              label="Sunday"
              selected={weekStart === 0}
              onPress={() => setWeekStart(0)}
            />
          </View>

          {savedMessage ? (
            <Text style={styles.successMessage}>{savedMessage}</Text>
          ) : null}

          <Button
            title="Save Profile"
            variant="primary"
            onPress={handleSaveProfile}
            loading={isSaving}
          />
        </Card>

        {/* Theme Preference */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Theme & Appearance</Text>
          <Text style={styles.cardDescription}>
            Level Up Planner is designed with a warm, minimalist cream palette for calm daily planning.
          </Text>
          <View style={styles.chipRow}>
            <Chip label="Warm Cream (Default)" selected={true} />
            <Chip label="Dark Mode (Coming soon)" selected={false} />
          </View>
        </Card>

        {/* Insights & Analytics */}
        <Card style={styles.card}>
          <Pressable
            onPress={() => router.push('/insights/monthly' as any)}
            style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="View Monthly Progress Summary"
          >
            <View style={styles.rowTitle}>
              <TrendingUp size={18} color={colors.forest} strokeWidth={2} />
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={styles.cardTitle}>Monthly Progress Summary</Text>
                <Text style={styles.cardDescription}>
                  Review calendar month stats, habit consistency, and milestones.
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </Pressable>
        </Card>

        {/* Life Categories */}
        <Card style={styles.card}>
          <Pressable
            onPress={() => router.push('/settings/categories' as any)}
            style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Manage Life Categories"
          >
            <View style={styles.rowTitle}>
              <Tag size={18} color={colors.forest} strokeWidth={2} />
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={styles.cardTitle}>Custom Life Categories</Text>
                <Text style={styles.cardDescription}>
                  Customize colors, icons, and personal life categories.
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </Pressable>
        </Card>

        {/* Reminders & Notifications */}
        <Card style={styles.card}>
          <Pressable
            onPress={() => router.push('/settings/reminders' as any)}
            style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Configure Reminders and Notifications"
          >
            <View style={styles.rowTitle}>
              <Bell size={18} color={colors.forest} strokeWidth={2} />
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={styles.cardTitle}>Reminders & Notifications</Text>
                <Text style={styles.cardDescription}>
                  Configure daily planning alerts, weekly reviews, and task alarms.
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </Pressable>
        </Card>

        {/* Privacy & Data Management */}
        <Card style={styles.card}>
          <Pressable
            onPress={() => router.push('/settings/data' as any)}
            style={({ pressed }) => [styles.navRow, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Manage Data & Privacy"
          >
            <View style={styles.rowTitle}>
              <Database size={18} color={colors.forest} strokeWidth={2} />
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={styles.cardTitle}>Data Ownership & Backup</Text>
                <Text style={styles.cardDescription}>
                  Backup to JSON, restore archives, export CSV, and control your data.
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </Pressable>
        </Card>

        {/* About App */}
        <Card style={styles.card}>
          <View style={styles.rowTitle}>
            <Info size={18} color={colors.charcoal} strokeWidth={2} />
            <Text style={[styles.cardTitle, { marginLeft: spacing.xs }]}>
              About Level Up Planner
            </Text>
          </View>
          <Text style={styles.cardDescription}>
            Version 1.0.0 (Local First Edition)
          </Text>
          <Text style={styles.tagline}>
            "Plan your life. Track your growth. Become your next level."
          </Text>
        </Card>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        visible={showResetModal}
        title="Reset All Data"
        message="This will permanently delete all your local tasks, goals, milestones, habits, notes, and journal reflections. This action cannot be undone."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={async () => {
          await resetAllData();
          setShowResetModal(false);
          router.replace('/(tabs)');
        }}
        onCancel={() => setShowResetModal(false)}
      />
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
    paddingBottom: spacing['4xl'],
  },
  card: {
    marginBottom: spacing.base,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.paleSage,
    borderWidth: 1,
    borderColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.charcoal,
  },
  profileRole: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  sectionLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tagline: {
    ...typography.caption,
    fontStyle: 'italic',
    color: colors.forest,
  },
  successMessage: {
    ...typography.caption,
    color: colors.success,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
});
