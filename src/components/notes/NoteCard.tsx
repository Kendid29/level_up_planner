// Level Up Planner — Note Card Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Note } from '../../types/models';
import { colors, spacing, typography } from '../../theme/tokens';
import { Card } from '../common/Card';
import { Chip } from '../common/Chip';
import { formatDisplayDate } from '../../domain/dates';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  const updatedDateStr = note.updated_at.split('T')[0];

  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`Note: ${note.title}`}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        {note.category ? <Chip label={note.category} /> : null}
      </View>
      <Text style={styles.bodySnippet} numberOfLines={3}>
        {note.body}
      </Text>
      <Text style={styles.dateText}>Updated {formatDisplayDate(updatedDateStr)}</Text>
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
  title: {
    ...typography.h3,
    color: colors.charcoal,
    flex: 1,
    marginRight: spacing.sm,
  },
  bodySnippet: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    color: colors.muted,
  },
});
