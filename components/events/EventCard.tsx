import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Event } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const colors = useColors();
  const router = useRouter();

  const totalTasks = event.tasks.length;
  const doneTasks = event.tasks.filter((t) => t.status === 'done').length;
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  const deptSet = new Set(event.tasks.map((t) => t.department));
  const departments = Array.from(deptSet);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
      onPress={() => router.push(`/events/${event.id}`)}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.eventName, { color: colors.foreground }]} numberOfLines={1}>
            {event.name}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <IconSymbol name="calendar" size={13} color={colors.muted} />
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {formatDate(event.date)} {event.time}
          </Text>
          <IconSymbol name="mappin" size={13} color={colors.muted} style={{ marginLeft: 8 }} />
          <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>

      {/* 진행률 바 */}
      {totalTasks > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.muted }]}>업무 진행률</Text>
            <Text style={[styles.progressCount, { color: colors.primary }]}>
              {doneTasks}/{totalTasks}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` as any, backgroundColor: colors.primary },
              ]}
            />
          </View>
        </View>
      )}

      {/* 부서 배지 */}
      {departments.length > 0 && (
        <View style={styles.deptRow}>
          {departments.map((dept) => {
            const info = DEPARTMENTS[dept];
            return (
              <View
                key={dept}
                style={[styles.deptBadge, { backgroundColor: info.color + '18' }]}
              >
                <View style={[styles.deptDot, { backgroundColor: info.color }]} />
                <Text style={[styles.deptText, { color: info.color }]}>{info.shortName}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 액션 버튼 */}
      <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
          onPress={() => router.push(`/events/${event.id}/plan`)}
        >
          <IconSymbol name="doc.text" size={14} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>기획안</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#10B981' + '15' }]}
          onPress={() => router.push(`/events/${event.id}/report`)}
        >
          <IconSymbol name="list.bullet.clipboard" size={14} color="#10B981" />
          <Text style={[styles.actionText, { color: '#10B981' }]}>사무보고서</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.border }]}
          onPress={() => router.push(`/events/${event.id}`)}
        >
          <IconSymbol name="arrow.right" size={14} color={colors.muted} />
          <Text style={[styles.actionText, { color: colors.muted }]}>상세보기</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  deptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  deptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deptText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 10,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
