import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PlanDocument, ProgramItem } from '@/lib/types';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { state, savePlanDoc } = useApp();

  const event = state.events.find((e) => e.id === id);

  const [overview, setOverview] = useState('');
  const [programs, setPrograms] = useState<ProgramItem[]>([
    { id: generateId(), time: '', activity: '', person: '', notes: '' },
  ]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (event?.planDoc) {
      setOverview(event.planDoc.overview);
      setPrograms(event.planDoc.programs.length > 0 ? event.planDoc.programs : [
        { id: generateId(), time: '', activity: '', person: '', notes: '' },
      ]);
      setNotes(event.planDoc.notes);
    } else if (event) {
      // 행사 개요 자동 채우기
      setOverview(
        `행사명: ${event.name}\n일시: ${event.date} ${event.time}\n장소: ${event.location}\n주최: 학과 학생회`
      );
    }
  }, [event?.id]);

  if (!event) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={{ color: colors.muted }}>행사를 찾을 수 없습니다.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const addProgram = () => {
    setPrograms((prev) => [
      ...prev,
      { id: generateId(), time: '', activity: '', person: '', notes: '' },
    ]);
  };

  const updateProgram = (idx: number, field: keyof ProgramItem, value: string) => {
    setPrograms((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const removeProgram = (idx: number) => {
    if (programs.length <= 1) return;
    setPrograms((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const doc: PlanDocument = {
      id: event.planDoc?.id || generateId(),
      eventId: event.id,
      overview,
      programs,
      notes,
      updatedAt: new Date().toISOString(),
    };
    savePlanDoc(event.id, doc);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('저장 완료', '기획안이 저장되었습니다.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>기획안</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]} numberOfLines={1}>
            {event.name}
          </Text>
        </View>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 행사 개요 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: colors.primary }]}>
              <Text style={styles.sectionNumText}>1</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>행사 개요</Text>
          </View>
          <View style={[styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.foreground }]}
              value={overview}
              onChangeText={setOverview}
              multiline
              numberOfLines={6}
              placeholder="행사 개요를 입력하세요..."
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 세부 프로그램 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: colors.primary }]}>
              <Text style={styles.sectionNumText}>2</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>세부 프로그램</Text>
          </View>

          {programs.map((program, idx) => (
            <View
              key={program.id}
              style={[styles.programCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.programHeader}>
                <Text style={[styles.programNum, { color: colors.primary }]}>#{idx + 1}</Text>
                {programs.length > 1 && (
                  <TouchableOpacity onPress={() => removeProgram(idx)}>
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
              <ProgramInputRow
                label="시간"
                value={program.time}
                onChangeText={(v) => updateProgram(idx, 'time', v)}
                placeholder="예: 14:00~14:30"
                colors={colors}
              />
              <ProgramInputRow
                label="내용"
                value={program.activity}
                onChangeText={(v) => updateProgram(idx, 'activity', v)}
                placeholder="프로그램 내용"
                colors={colors}
              />
              <ProgramInputRow
                label="담당"
                value={program.person}
                onChangeText={(v) => updateProgram(idx, 'person', v)}
                placeholder="담당자/부서"
                colors={colors}
              />
              <ProgramInputRow
                label="비고"
                value={program.notes}
                onChangeText={(v) => updateProgram(idx, 'notes', v)}
                placeholder="특이사항"
                colors={colors}
                isLast
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addProgramBtn, { borderColor: colors.primary }]}
            onPress={addProgram}
          >
            <IconSymbol name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addProgramText, { color: colors.primary }]}>프로그램 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 기타 사항 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: colors.primary }]}>
              <Text style={styles.sectionNumText}>3</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>기타 사항</Text>
          </View>
          <View style={[styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.foreground }]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder="준비물, 주의사항, 예산 등을 입력하세요..."
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProgramInputRow({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  isLast,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View>
      <View style={styles.programRow}>
        <Text style={[styles.programLabel, { color: colors.muted }]}>{label}</Text>
        <TextInput
          style={[styles.programInput, { color: colors.foreground }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.border}
          returnKeyType="done"
        />
      </View>
      {!isLast && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  sectionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 100,
  },
  programCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  programNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  programLabel: {
    fontSize: 13,
    width: 36,
  },
  programInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    marginLeft: 14,
  },
  addProgramBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 6,
    marginTop: 4,
  },
  addProgramText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
