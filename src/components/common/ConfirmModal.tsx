// Level Up Planner: Accessible Confirmation Dialog Modal
import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { Button } from './Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actionRow}>
            <View style={styles.buttonFlex}>
              <Button
                title={cancelLabel}
                variant="secondary"
                onPress={onCancel}
              />
            </View>
            <View style={styles.buttonFlex}>
              <Button
                title={confirmLabel}
                variant={isDestructive ? 'destructive' : 'primary'}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.paper,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: {
    ...typography.h2,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonFlex: {
    flex: 1,
  },
});
