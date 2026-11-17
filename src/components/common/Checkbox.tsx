// Level Up Planner: Reusable Accessible Checkbox Component
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  subtitle?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  onPress,
  label,
  subtitle,
  disabled = false,
  accessibilityLabel,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel || label || 'Checkbox'}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked ? <Check size={14} color={colors.white} strokeWidth={2.5} /> : null}
      </View>
      {label ? (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.labelText,
              checked && styles.labelTextCompleted,
              disabled && styles.textDisabled,
            ]}
          >
            {label}
          </Text>
          {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44, // 44px accessible touch target
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.75,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.muted,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  labelText: {
    ...typography.body,
    color: colors.charcoal,
  },
  labelTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  subtitleText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  textDisabled: {
    color: colors.muted,
  },
});
