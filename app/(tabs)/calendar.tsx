import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Event } from '@/lib/types';

// 한국어 로케일 설정
LocaleConfig.locales['ko'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // 날짜별 행사 맵
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    state.events.forEach((event) => {
      const date = event.date;
      if (!marks[date]) {
        marks[date] = { dots: [], marked: true };
      }
      if (marks[date].dots.length < 3) {
        marks[date].dots.push({ color: '#4F6AF5', selectedDotColor: '#fff' });
      }
    });

    // 선택된 날짜 표시
    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#4F6AF5',
      };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#4F6AF5' };
    }

    return marks;
  }, [state.events, selectedDate]);

  // 선택된 날짜의 행사
  const selectedEvents = useMemo(
    () => state.events.filter((e) => e.date === selectedDate),
    [state.events, selectedDate]
  );

  const formatSelectedDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  };

  return (
    <ScreenContainer className="flex-1">
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>캘린더</Text>
      </View>

      <FlatList
        data={selectedEvents}
        keyExtractor={(item: Event) => item.id}
        ListHeaderComponent={
          <View>
            <Calendar
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
              theme={{
                backgroundColor: colors.background,
                calendarBackground: colors.background,
                textSectionTitleColor: colors.muted,
                selectedDayBackgroundColor: '#4F6AF5',
                selectedDayTextColor: '#fff',
                todayTextColor: '#4F6AF5',
                dayTextColor: colors.foreground,
                textDisabledColor: colors.border,
                dotColor: '#4F6AF5',
                selectedDotColor: '#fff',
                arrowColor: '#4F6AF5',
                monthTextColor: colors.foreground,
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
            />
            <View style={[styles.dateHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dateTitle, { color: colors.foreground }]}>
                {formatSelectedDate(selectedDate)}
              </Text>
              <Text style={[styles.dateCount, { color: colors.muted }]}>
                {selectedEvents.length}개 행사
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.eventItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/events/${item.id}`)}
          >
            <View style={[styles.eventDot, { backgroundColor: '#4F6AF5' }]} />
            <View style={styles.eventInfo}>
              <Text style={[styles.eventName, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.eventMeta, { color: colors.muted }]}>
                {item.time} · {item.location}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              이 날에는 행사가 없습니다
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
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
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateCount: {
    fontSize: 13,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
  },
  eventMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
