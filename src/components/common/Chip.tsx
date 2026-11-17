// Level Up Planner — Reusable Chip / Badge Component
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { PriorityLevel, GoalHorizon } from '../../types/models';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  priority?: PriorityLevel;
  horizon?: GoalHorizon;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  label,
  selected = false,
  onPress,
  priority,
  horizon,
  style,
}: ChipProps) {
  const getContainerStyle = () => {
    if (selected) {
      return styles.selected;
    }
    if (priority === 'high') {
      return styles.priorityHigh;
    }
    if (priority === 'medium') {
      return styles.priorityMedium;
    }
    if (priority === 'low') {
      return styles.priorityLow;
    }
    if (horizon) {
      return styles.horizon;
    }
    return styles.default;
  };

  const getTextStyle = () => {
    if (selected) {
      return styles.selectedText;
    }
    if (priority === 'high') {
      return styles.priorityHighText;
    }
    if (priority === 'medium') {
      return styles.priorityMediumText;
    }
    if (priority === 'low') {
      return styles.priorityLowText;
    }
    return styles.defaultText;
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          getContainerStyle(),
          pressed && styles.pressed,
          style,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text style={[styles.text, getTextStyle()]}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.container, getContainerStyle(), style]}>
      <Text style={[styles.text, getTextStyle()]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
  default: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
  },
  defaultText: {
    color: colors.charcoal,
  },
  selected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  selectedText: {
    color: colors.white,
  },
  priorityHigh: {
    backgroundColor: '#FBEBEA',
    borderColor: colors.error,
  },
  priorityHighText: {
    color: colors.error,
  },
  priorityMedium: {
    backgroundColor: '#FCF5EB',
    borderColor: colors.warning,
  },
  priorityMediumText: {
    color: colors.warning,
  },
  priorityLow: {
    backgroundColor: colors.paleSage,
    borderColor: colors.sage,
  },
  priorityLowText: {
    color: colors.forest,
  },
  horizon: {
    backgroundColor: colors.paleSage,
    borderColor: colors.sage,
  },
});
