import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskStatus } from '@/lib/types';
import { TASK_STATUS_LABELS } from '@/lib/constants';

interface Props {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: Props) {
  const info = TASK_STATUS_LABELS[status];
  return (
    <View style={[styles.badge, { backgroundColor: info.bgColor }]}>
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
