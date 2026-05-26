import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Department } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';

interface Props {
  department: Department;
  size?: 'sm' | 'md';
}

export function DepartmentBadge({ department, size = 'sm' }: Props) {
  const dept = DEPARTMENTS[department];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: dept.color + '20', borderColor: dept.color + '40' },
        isSmall ? styles.small : styles.medium,
      ]}
    >
      <Text style={[styles.text, { color: dept.color }, isSmall ? styles.smallText : styles.mediumText]}>
        {isSmall ? dept.shortName : dept.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
});
