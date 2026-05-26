import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEPARTMENTS } from '@/lib/constants';
import { Department } from '@/lib/types';

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();

  // 부서별 업무 통계
  const deptStats = Object.entries(DEPARTMENTS).map(([key, info]) => {
    const allTasks = state.events.flatMap((e) => e.tasks).filter((t) => t.department === key);
    const done = allTasks.filter((t) => t.status === 'done').length;
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
    const pending = allTasks.filter((t) => t.status === 'pending').length;
    return { key: key as Department, info, total: allTasks.length, done, inProgress, pending };
  });

  return (
    <ScreenContainer className="flex-1">
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>더보기</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 회의록 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>회의록 관리</Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/meetings')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#4F6AF5' + '18' }]}>
              <IconSymbol name="note.text" size={22} color="#4F6AF5" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.foreground }]}>회의록</Text>
              <Text style={[styles.menuSubtitle, { color: colors.muted }]}>
                {state.meetings.length}개 · AI 자동 요약 지원
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* 부서별 업무 현황 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>부서별 업무 현황</Text>
          {deptStats.map(({ key, info, total, done, inProgress, pending }) => (
            <View
              key={key}
              style={[styles.deptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.deptHeader}>
                <View style={[styles.deptColorBar, { backgroundColor: info.color }]} />
                <Text style={[styles.deptName, { color: colors.foreground }]}>{info.name}</Text>
                <Text style={[styles.deptTotal, { color: colors.muted }]}>총 {total}개</Text>
              </View>
              {total > 0 ? (
                <View style={styles.deptStats}>
                  <DeptStatChip label="대기" count={pending} color="#6B7280" bgColor="#F3F4F6" />
                  <DeptStatChip label="진행중" count={inProgress} color="#F59E0B" bgColor="#FEF3C7" />
                  <DeptStatChip label="완료" count={done} color="#10B981" bgColor="#D1FAE5" />
                </View>
              ) : (
                <Text style={[styles.noTask, { color: colors.muted }]}>배정된 업무 없음</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function DeptStatChip({
  label,
  count,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bgColor }]}>
      <Text style={[styles.chipCount, { color }]}>{count}</Text>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  deptCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  deptColorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  deptTotal: {
    fontSize: 13,
  },
  deptStats: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  chipCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  noTask: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
