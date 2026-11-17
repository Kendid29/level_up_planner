// Level Up Planner: Journal Card Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JournalEntry } from '../../types/models';
import { colors, spacing, typography } from '../../theme/tokens';
import { Card } from '../common/Card';
import { formatDisplayDate } from '../../domain/dates';

interface JournalCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

export function JournalCard({ entry, onPress }: JournalCardProps) {
  return (
    <Card
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`Journal entry for ${entry.entry_date}`}
    >
      <View style={styles.headerRow}>
        <Text style={styles.dateBadge}>{formatDisplayDate(entry.entry_date)}</Text>
      </View>
      {entry.title ? (
        <Text style={styles.title} numberOfLines={1}>
          {entry.title}
        </Text>
      ) : null}
      <Text style={styles.bodySnippet} numberOfLines={3}>
        {entry.body}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateBadge: {
    ...typography.caption,
    color: colors.forest,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  bodySnippet: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 20,
  },
});
