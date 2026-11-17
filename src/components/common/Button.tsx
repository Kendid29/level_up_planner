// Level Up Planner — Reusable Button Component
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  accessibilityLabel,
}: ButtonProps) {
  const getContainerStyle = (pressed: boolean) => {
    const base: ViewStyle = {
      ...styles.base,
      opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
    };

    switch (variant) {
      case 'primary':
        return [base, styles.primary, style];
      case 'secondary':
        return [base, styles.secondary, style];
      case 'destructive':
        return [base, styles.destructive, style];
      case 'ghost':
        return [base, styles.ghost, style];
      default:
        return [base, styles.primary, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'destructive':
        return [styles.whiteText, textStyle];
      case 'secondary':
      case 'ghost':
        return [styles.forestText, textStyle];
      default:
        return [styles.whiteText, textStyle];
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => getContainerStyle(pressed)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? colors.white : colors.forest}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.forest,
  },
  secondary: {
    backgroundColor: colors.paleSage,
    borderWidth: 1,
    borderColor: colors.sage,
  },
  destructive: {
    backgroundColor: colors.error,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  whiteText: {
    ...typography.button,
    color: colors.white,
  },
  forestText: {
    ...typography.button,
    color: colors.forest,
  },
});
