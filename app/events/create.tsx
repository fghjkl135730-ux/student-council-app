import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChecklistItemKey } from '@/lib/types';
import { CHECKLIST_ITEMS, DEPARTMENTS } from '@/lib/constants';

const CHECKLIST_KEYS = Object.keys(CHECKLIST_ITEMS) as ChecklistItemKey[];

export default function CreateEventScreen() {
  const colors = useColors();
  const router = useRouter();
  const { createEvent } = useApp();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItemKey[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChecklist = (key: ChecklistItemKey) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setChecklist((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 날짜 자동 포맷팅: 8자 입력 시 YYYY-MM-DD 형식으로 변환
  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length === 8) {
      const formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
      setDate(formatted);
    } else {
      setDate(text);
    }
  };

  // 시간 자동 포맷팅: 4자 입력 시 HH:mm 형식으로 변환
  const handleTimeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length === 4) {
      const formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
      setTime(formatted);
    } else {
      setTime(text);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('입력 오류', '행사 이름을 입력해주세요.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('입력 오류', '날짜를 입력해주세요. (예: 2025-06-15)');
      return;
    }
    if (!time.trim()) {
      Alert.alert('입력 오류', '시간을 입력해주세요. (예: 14:00)');
      return;
    }
    if (!location.trim()) {
      Alert.alert('입력 오류', '장소를 입력해주세요.');
      return;
    }
    if (checklist.length === 0) {
      Alert.alert('입력 오류', '최소 하나의 업무를 선택해주세요.');
      return;
    }

    // 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('입력 오류', '날짜 형식이 올바르지 않습니다. (예: 2025-06-15)');
      return;
    }

    setIsSubmitting(true);
    try {
      createEvent({ name: name.trim(), date, time, location: location.trim(), checklist });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch {
      Alert.alert('오류', '행사 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>새 행사 만들기</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 기본 정보 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>기본 정보</Text>

          <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InputRow
              label="행사 이름"
              icon="calendar"
              value={name}
              onChangeText={setName}
              placeholder="예: 2025 학과 체육대회"
              colors={colors}
            />
            <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
            <InputRow
              label="날짜"
              icon="calendar"
              value={date}
              onChangeText={handleDateChange}
              placeholder="20250615 또는 2025-06-15"
              colors={colors}
              keyboardType="numbers-and-punctuation"
            />
            <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
            <InputRow
              label="시간"
              icon="clock"
              value={time}
              onChangeText={handleTimeChange}
              placeholder="1400 또는 14:00"
              colors={colors}
              keyboardType="numbers-and-punctuation"
            />
            <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
            <InputRow
              label="장소"
              icon="mappin"
              value={location}
              onChangeText={setLocation}
              placeholder="예: 학생회관 대강당"
              colors={colors}
            />
          </View>
        </View>

        {/* 스마트 체크리스트 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>스마트 체크리스트</Text>
            <Text style={[styles.sectionHint, { color: colors.muted }]}>
              선택한 항목이 해당 부서에 자동 배정됩니다
            </Text>
          </View>

          <View style={styles.checklistContainer}>
            {CHECKLIST_KEYS.map((key) => {
              const item = CHECKLIST_ITEMS[key];
              const dept = DEPARTMENTS[item.department];
              const isSelected = checklist.includes(key);

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.checklistItem,
                    {
                      backgroundColor: isSelected ? colors.primary + '12' : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleChecklist(key)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {isSelected && <IconSymbol name="checkmark" size={13} color="#fff" />}
                  </View>

                  <View style={styles.checklistContent}>
                    <Text style={[styles.checklistLabel, { color: colors.foreground }]}>
                      {item.label}
                    </Text>
                    <View style={styles.checklistMeta}>
                      <View style={[styles.deptBadge, { backgroundColor: dept.color + '18' }]}>
                        <View style={[styles.deptDot, { backgroundColor: dept.color }]} />
                        <Text style={[styles.deptText, { color: dept.color }]}>{dept.name}</Text>
                      </View>
                      {item.autoRegisterFacility && (
                        <View style={[styles.autoBadge, { backgroundColor: '#10B981' + '18' }]}>
                          <Text style={[styles.autoText, { color: '#10B981' }]}>
                            시설 대여 자동 등록
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 선택된 업무 요약 */}
        {checklist.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.summaryTitle, { color: colors.primary }]}>
              {checklist.length}개 업무가 자동 배정됩니다
            </Text>
            {checklist.map((key) => {
              const item = CHECKLIST_ITEMS[key];
              const dept = DEPARTMENTS[item.department];
              return (
                <View key={key} style={styles.summaryItem}>
                  <View style={[styles.summaryDot, { backgroundColor: dept.color }]} />
                  <Text style={[styles.summaryText, { color: colors.foreground }]}>
                    {item.label} → <Text style={{ color: dept.color, fontWeight: '600' }}>{dept.name}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 하단 생성 버튼 */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: isSubmitting ? colors.muted : colors.primary },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
          <Text style={styles.submitText}>
            {isSubmitting ? '생성 중...' : '행사 생성 및 업무 배정'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

function InputRow({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  colors,
  keyboardType,
}: {
  label: string;
  icon: any;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  colors: any;
  keyboardType?: any;
}) {
  return (
    <View style={styles.inputRow}>
      <IconSymbol name={icon} size={18} color={colors.muted} style={{ width: 24 }} />
      <Text style={[styles.inputLabel, { color: colors.muted }]}>{label}</Text>
      <TextInput
        style={[styles.textInput, { color: colors.foreground }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.border}
        keyboardType={keyboardType}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 12,
    marginTop: 3,
  },
  inputGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    width: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  inputDivider: {
    height: 1,
    marginLeft: 16,
  },
  checklistContainer: {
    marginTop: 10,
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistContent: {
    flex: 1,
    gap: 6,
  },
  checklistLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  checklistMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
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
  autoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryText: {
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
