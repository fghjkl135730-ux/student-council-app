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
import { ReportDocument, PurchaseItem } from '@/lib/types';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { state, saveReportDoc } = useApp();

  const event = state.events.find((e) => e.id === id);

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    { id: generateId(), name: '', quantity: 1, unitPrice: 0, totalPrice: 0, notes: '' },
  ]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [photoChecklist, setPhotoChecklist] = useState({
    receipt: false,
    items: false,
    event: false,
  });

  useEffect(() => {
    if (event?.reportDoc) {
      setPurchaseItems(
        event.reportDoc.purchaseItems.length > 0
          ? event.reportDoc.purchaseItems
          : [{ id: generateId(), name: '', quantity: 1, unitPrice: 0, totalPrice: 0, notes: '' }]
      );
      setSpecialNotes(event.reportDoc.specialNotes);
      setPhotoChecklist(event.reportDoc.photoChecklist);
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

  const addItem = () => {
    setPurchaseItems((prev) => [
      ...prev,
      { id: generateId(), name: '', quantity: 1, unitPrice: 0, totalPrice: 0, notes: '' },
    ]);
  };

  const removeItem = (idx: number) => {
    if (purchaseItems.length <= 1) return;
    setPurchaseItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof PurchaseItem, value: string | number) => {
    setPurchaseItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        // 총액 자동 계산
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const togglePhoto = (key: keyof typeof photoChecklist) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPhotoChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    const doc: ReportDocument = {
      id: event.reportDoc?.id || generateId(),
      eventId: event.id,
      purchaseItems,
      specialNotes,
      photoChecklist,
      updatedAt: new Date().toISOString(),
    };
    saveReportDoc(event.id, doc);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('저장 완료', '사무보고서가 저장되었습니다.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  const photoItems = [
    { key: 'receipt' as const, label: '영수증 원본', icon: 'photo', desc: '구매 영수증 사진' },
    { key: 'items' as const, label: '실물 구매품', icon: 'photo', desc: '구매한 물품 사진' },
    { key: 'event' as const, label: '행사 진행 현장', icon: 'camera', desc: '행사 현장 사진' },
  ];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>사무보고서</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]} numberOfLines={1}>
            {event.name}
          </Text>
        </View>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#10B981' }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 구매 물품 리스트 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: '#10B981' }]}>
              <Text style={styles.sectionNumText}>1</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>구매 물품 리스트</Text>
          </View>

          {purchaseItems.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.itemHeader}>
                <Text style={[styles.itemNum, { color: '#10B981' }]}>물품 #{idx + 1}</Text>
                {purchaseItems.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(idx)}>
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <ItemInputRow
                label="품목명"
                value={item.name}
                onChangeText={(v) => updateItem(idx, 'name', v)}
                placeholder="구매 물품명"
                colors={colors}
              />
              <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
              <View style={styles.itemRow}>
                <View style={styles.itemHalf}>
                  <Text style={[styles.itemLabel, { color: colors.muted }]}>수량</Text>
                  <TextInput
                    style={[styles.itemInput, { color: colors.foreground }]}
                    value={item.quantity.toString()}
                    onChangeText={(v) => updateItem(idx, 'quantity', parseInt(v) || 0)}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
                <View style={[styles.itemDividerV, { backgroundColor: colors.border }]} />
                <View style={styles.itemHalf}>
                  <Text style={[styles.itemLabel, { color: colors.muted }]}>단가(원)</Text>
                  <TextInput
                    style={[styles.itemInput, { color: colors.foreground }]}
                    value={item.unitPrice.toString()}
                    onChangeText={(v) => updateItem(idx, 'unitPrice', parseInt(v.replace(/,/g, '')) || 0)}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              </View>
              <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
              <View style={[styles.totalRow, { backgroundColor: '#10B981' + '10' }]}>
                <Text style={[styles.totalLabel, { color: '#10B981' }]}>합계</Text>
                <Text style={[styles.totalValue, { color: '#10B981' }]}>
                  {item.totalPrice.toLocaleString()}원
                </Text>
              </View>
              <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
              <ItemInputRow
                label="비고"
                value={item.notes}
                onChangeText={(v) => updateItem(idx, 'notes', v)}
                placeholder="특이사항"
                colors={colors}
                isLast
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addItemBtn, { borderColor: '#10B981' }]}
            onPress={addItem}
          >
            <IconSymbol name="plus" size={16} color="#10B981" />
            <Text style={[styles.addItemText, { color: '#10B981' }]}>물품 추가</Text>
          </TouchableOpacity>

          {/* 총합계 */}
          <View style={[styles.totalCard, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '40' }]}>
            <Text style={[styles.totalCardLabel, { color: '#10B981' }]}>총 구매 금액</Text>
            <Text style={[styles.totalCardValue, { color: '#10B981' }]}>
              {totalAmount.toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 특이사항 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: '#10B981' }]}>
              <Text style={styles.sectionNumText}>2</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>특이사항</Text>
          </View>
          <View style={[styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.foreground }]}
              value={specialNotes}
              onChangeText={setSpecialNotes}
              multiline
              numberOfLines={4}
              placeholder="예산 초과 사유, 구매 변경 사항 등을 입력하세요..."
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 증빙사진 체크리스트 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionNum, { backgroundColor: '#10B981' }]}>
              <Text style={styles.sectionNumText}>3</Text>
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>필수 증빙사진 체크리스트</Text>
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                누락 방지를 위해 사진 첨부 여부를 확인하세요
              </Text>
            </View>
          </View>

          <View style={[styles.photoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {photoItems.map((photo, idx) => (
              <View key={photo.key}>
                <TouchableOpacity
                  style={styles.photoRow}
                  onPress={() => togglePhoto(photo.key)}
                >
                  <View
                    style={[
                      styles.photoCheck,
                      {
                        backgroundColor: photoChecklist[photo.key] ? '#10B981' : 'transparent',
                        borderColor: photoChecklist[photo.key] ? '#10B981' : colors.border,
                      },
                    ]}
                  >
                    {photoChecklist[photo.key] && (
                      <IconSymbol name="checkmark" size={13} color="#fff" />
                    )}
                  </View>
                  <View style={styles.photoContent}>
                    <Text style={[styles.photoLabel, { color: colors.foreground }]}>
                      {photo.label}
                    </Text>
                    <Text style={[styles.photoDesc, { color: colors.muted }]}>{photo.desc}</Text>
                  </View>
                  <View
                    style={[
                      styles.photoBadge,
                      {
                        backgroundColor: photoChecklist[photo.key]
                          ? '#10B981' + '20'
                          : '#EF4444' + '15',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.photoBadgeText,
                        { color: photoChecklist[photo.key] ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {photoChecklist[photo.key] ? '완료' : '미완료'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {idx < photoItems.length - 1 && (
                  <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>

          {/* 체크리스트 완료 여부 */}
          {Object.values(photoChecklist).every(Boolean) ? (
            <View style={[styles.allDoneCard, { backgroundColor: '#10B981' + '15' }]}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
              <Text style={[styles.allDoneText, { color: '#10B981' }]}>
                모든 증빙사진이 확인되었습니다!
              </Text>
            </View>
          ) : (
            <View style={[styles.warningCard, { backgroundColor: '#F59E0B' + '15' }]}>
              <IconSymbol name="info.circle" size={20} color="#F59E0B" />
              <Text style={[styles.warningText, { color: '#F59E0B' }]}>
                {Object.values(photoChecklist).filter(Boolean).length}/3 항목 확인됨 — 미완료 항목을 확인해주세요
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ItemInputRow({
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
    <View style={styles.itemInputRow}>
      <Text style={[styles.itemLabel, { color: colors.muted }]}>{label}</Text>
      <TextInput
        style={[styles.itemInput, { color: colors.foreground, flex: 1 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.border}
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
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  sectionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
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
  sectionHint: {
    fontSize: 12,
    marginTop: 2,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  itemNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  itemLabel: {
    fontSize: 13,
    width: 52,
  },
  itemInput: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  itemDividerV: {
    width: 1,
    marginVertical: 8,
  },
  rowDivider: {
    height: 1,
    marginLeft: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  addItemBtn: {
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
  addItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  totalCardLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalCardValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 80,
  },
  photoCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  photoCheck: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContent: {
    flex: 1,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  photoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  allDoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  allDoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
