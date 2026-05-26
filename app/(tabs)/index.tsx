import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { EventCard } from '@/components/events/EventCard';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Event } from '@/lib/types';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = useMemo(() => {
    const thisMonthEvents = state.events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const upcoming = thisMonthEvents.filter((e) => new Date(e.date) >= now);
    const allTasks = state.events.flatMap((e) => e.tasks);
    const doneTasks = allTasks.filter((t) => t.status === 'done').length;
    return {
      total: thisMonthEvents.length,
      upcoming: upcoming.length,
      done: doneTasks,
      total_tasks: allTasks.length,
    };
  }, [state.events, currentMonth, currentYear]);

  const sortedEvents = useMemo(
    () => [...state.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [state.events]
  );

  const renderHeader = () => (
    <View>
      {/* 상단 헤더 */}
      <View style={[styles.topHeader, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.headerTitle}>학생회 이벤트</Text>
          <Text style={styles.headerSubtitle}>
            {currentYear}년 {currentMonth + 1}월
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/events/create')}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 요약 카드 */}
      <View style={[styles.statsContainer, { backgroundColor: colors.primary }]}>
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <StatItem label="이번 달 행사" value={stats.total} color={colors.primary} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatItem label="예정된 행사" value={stats.upcoming} color="#F59E0B" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatItem
            label="완료된 업무"
            value={`${stats.done}/${stats.total_tasks}`}
            color="#10B981"
          />
        </View>
      </View>

      {/* 행사 목록 헤더 */}
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.foreground }]}>전체 행사</Text>
        <Text style={[styles.listCount, { color: colors.muted }]}>{state.events.length}개</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="calendar" size={56} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>등록된 행사가 없습니다</Text>
      <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
        + 버튼을 눌러 첫 번째 행사를 만들어보세요
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/events/create')}
      >
        <Text style={styles.emptyButtonText}>행사 만들기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-primary">
      <FlatList
        data={sortedEvents}
        keyExtractor={(item: Event) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: colors.background },
        ]}
        style={{ backgroundColor: colors.primary }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  statsCard: {
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    marginVertical: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listCount: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
