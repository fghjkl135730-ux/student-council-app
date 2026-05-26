// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings
 */
const MAPPING = {
  // 기존
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  // 탭 아이콘
  "calendar": "calendar-today",
  "calendar.fill": "event",
  "building.2": "business",
  "building.2.fill": "business",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-horiz",
  "ellipsis.circle.fill": "more-horiz",
  // 행사 관련
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "pencil": "edit",
  "trash": "delete",
  "checkmark": "check",
  "checkmark.circle": "check-circle-outline",
  "checkmark.circle.fill": "check-circle",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  // 문서
  "doc.text": "description",
  "doc.text.fill": "description",
  "doc.fill": "insert-drive-file",
  "list.bullet": "list",
  "list.bullet.clipboard": "assignment",
  // 시설
  "mappin": "place",
  "mappin.circle.fill": "location-on",
  "clock": "access-time",
  "clock.fill": "access-time-filled",
  // 회의
  "note.text": "notes",
  "sparkles": "auto-awesome",
  "person.2": "group",
  "person.2.fill": "group",
  // 상태
  "circle": "radio-button-unchecked",
  "circle.fill": "radio-button-checked",
  "arrow.right": "arrow-forward",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "chevron.left": "chevron-left",
  // 기타
  "info.circle": "info",
  "gear": "settings",
  "bell": "notifications",
  "bell.fill": "notifications",
  "photo": "photo",
  "camera": "camera-alt",
} as unknown as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
