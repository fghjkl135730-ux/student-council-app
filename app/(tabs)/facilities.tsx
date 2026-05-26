import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FACILITY_STATUS_LABELS } from '@/lib/constants';
import { FacilityRental, FacilityStatus } from '@/lib/types';

export default function FacilitiesScreen() {
  const colors = useColors();
  const { state, updateFacilityStatus } = useApp();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 이번 달 시설 대여 목록
  const thisMonthFacilities = useMemo(
    () =>
      state.facilities.filter((f) => {
        const d = new Date(f.date + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [state.facilities, currentMonth, currentYear]
  );

  const neededCount = thisMonthFacilities.filter((f) => f.status === 'needed').length;
  const appliedCount = thisMonthFacilities.filter((f) => f.status === 'applied').length;

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const handleStatusChange = (facility: FacilityRental, newStatus: FacilityStatus) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    updateFacilityStatus(facility.id, newStatus);
  };

  const handleApply = (facility: FacilityRental) => {
    Alert.alert(
      '대여 신청',
      `"${facility.location}" 장소 대여를 신청하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '신청',
          onPress: () => handleStatusChange(facility, 'applied'),
        },
      ]
    );
  };

  const handleCancel = (facility: FacilityRental) => {
    Alert.alert(
      '예약 취소',
      `"${facility.location}" 예약을 취소하시겠습니까?`,
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '취소',
          style: 'destructive',
          onPress: () => handleStatusChange(facility, 'cancelled'),
        },
      ]
    );
  };

  const handleRestore = (facility: FacilityRental) => {
    handleStatusChange(facility, 'needed');
  };

  return (
    <ScreenContainer className="flex-1">
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>시설 대여</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 이번 달 요약 */}
        <View style={styles.summarySection}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>
            {currentYear}년 {currentMonth + 1}월 요약
          </Text>
          <View style={styles.summaryCards}>
            <View style={[styles.summaryCard, { backgroundColor: '#EF4444' + '12', borderColor: '#EF4444' + '30' }]}>
              <Text style={[styles.summaryNum, { color: '#EF4444' }]}>{neededCount}</Text>
              <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>대여 필요</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#10B981' + '12', borderColor: '#10B981' + '30' }]}>
              <Text style={[styles.summaryNum, { color: '#10B981' }]}>{appliedCount}</Text>
              <Text style={[styles.summaryLabel, { color: '#10B981' }]}>신청 완료</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.summaryNum, { color: colors.primary }]}>{thisMonthFacilities.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.primary }]}>전체</Text>
            </View>
          </View>
        </View>

        {/* 이번 달 대여 필요 목록 테이블 */}
        {thisMonthFacilities.length > 0 && (
          <View style={styles.tableSection}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>이번 달 대여 목록</Text>
            <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* 테이블 헤더 */}
              <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.border + '60' }]}>
                <Text style={[styles.tableHeaderText, { color: colors.muted, flex: 2 }]}>장소</Text>
                <Text style={[styles.tableHeaderText, { color: colors.muted, flex: 2 }]}>행사</Text>
                <Text style={[styles.tableHeaderText, { color: colors.muted, flex: 1 }]}>날짜</Text>
                <Text style={[styles.tableHeaderText, { color: colors.muted, flex: 1 }]}>상태</Text>
              </View>
              {thisMonthFacilities.map((facility, idx) => {
                const statusInfo = FACILITY_STATUS_LABELS[facility.status];
                return (
                  <View key={facility.id}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { color: colors.foreground, flex: 2 }]} numberOfLines={1}>
                        {facility.location}
                      </Text>
                      <Text style={[styles.tableCell, { color: colors.foreground, flex: 2 }]} numberOfLines={1}>
                        {facility.eventName}
                      </Text>
                      <Text style={[styles.tableCell, { color: colors.muted, flex: 1 }]}>
                        {formatDate(facility.date)}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <View style={[styles.statusDot, { backgroundColor: statusInfo.bgColor }]}>
                          <Text style={[styles.statusDotText, { color: statusInfo.color }]} numberOfLines={1}>
                            {statusInfo.label.replace('대여 ', '')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {idx < thisMonthFacilities.length - 1 && (
                      <View style={[styles.tableDivider, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 전체 시설 대여 카드 목록 */}
        <View style={styles.cardsSection}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>전체 대여 목록</Text>

          {state.facilities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="building.2" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                등록된 시설 대여가 없습니다
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                행사 생성 시 '장소 대여' 항목을 선택하면{'\n'}자동으로 등록됩니다
              </Text>
            </View>
          ) : (
            state.facilities.map((facility) => {
              const statusInfo = FACILITY_STATUS_LABELS[facility.status];
              return (
                <View
                  key={facility.id}
                  style={[styles.facilityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  {/* 카드 헤더 */}
                  <View style={styles.cardHeader}>
                    <View style={styles.locationRow}>
                      <IconSymbol name="mappin.circle.fill" size={18} color={colors.primary} />
                      <Text style={[styles.locationText, { color: colors.foreground }]}>
                        {facility.location}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  {/* 행사 정보 */}
                  <View style={styles.cardMeta}>
                    <View style={styles.metaRow}>
                      <IconSymbol name="calendar" size={13} color={colors.muted} />
                      <Text style={[styles.metaText, { color: colors.muted }]}>
                        {facility.date} {facility.time}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <IconSymbol name="list.bullet" size={13} color={colors.muted} />
                      <Text style={[styles.metaText, { color: colors.muted }]}>
                        {facility.eventName}
                      </Text>
                    </View>
                  </View>

                  {/* 액션 버튼 */}
                  <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                    {facility.status === 'needed' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        onPress={() => handleApply(facility)}
                      >
                        <Text style={styles.actionBtnText}>대여 신청</Text>
                      </TouchableOpacity>
                    )}
                    {facility.status === 'applied' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleCancel(facility)}
                      >
                        <Text style={styles.actionBtnText}>예약 취소</Text>
                      </TouchableOpacity>
                    )}
                    {facility.status === 'cancelled' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.muted }]}
                        onPress={() => handleRestore(facility)}
                      >
                        <Text style={styles.actionBtnText}>다시 신청</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  summarySection: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryNum: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tableSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  table: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tableHeader: {
    paddingVertical: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 13,
  },
  tableDivider: {
    height: 1,
    marginHorizontal: 12,
  },
  statusDot: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusDotText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardsSection: {
    padding: 16,
    paddingTop: 8,
  },
  facilityCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  cardActions: {
    borderTopWidth: 1,
    padding: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
