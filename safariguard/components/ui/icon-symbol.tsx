// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "car.fill": "directions-car",
  "chart.bar.fill": "bar-chart",
  "bell.fill": "notifications",
  "person.fill": "person",
  "map.fill": "map",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  // Fleet
  "car.2.fill": "commute",
  "speedometer": "speed",
  "location.fill": "location-on",
  "wifi": "wifi",
  "wifi.slash": "wifi-off",
  "battery.100": "battery-full",
  "battery.25": "battery-alert",
  // Passengers
  "person.2.fill": "people",
  "person.3.fill": "group",
  "arrow.up.circle.fill": "arrow-circle-up",
  "arrow.down.circle.fill": "arrow-circle-down",
  // Driver
  "star.fill": "star",
  "shield.fill": "shield",
  "exclamationmark.triangle.fill": "warning",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  // Analytics
  "chart.line.uptrend.xyaxis": "trending-up",
  "chart.pie.fill": "pie-chart",
  "clock.fill": "access-time",
  "calendar": "calendar-today",
  // Alerts
  "bell.badge.fill": "notification-important",
  "bolt.fill": "bolt",
  "flame.fill": "local-fire-department",
  "info.circle.fill": "info",
  // AI
  "brain": "psychology",
  "lightbulb.fill": "lightbulb",
  "sparkles": "auto-awesome",
  // Settings
  "gear": "settings",
  "lock.fill": "lock",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "phone.fill": "phone",
  "envelope.fill": "email",
  "arrow.right.square.fill": "logout",
  // General
  "plus.circle.fill": "add-circle",
  "magnifyingglass": "search",
  "line.3.horizontal.decrease": "filter-list",
  "arrow.clockwise": "refresh",
  "ellipsis.circle": "more-horiz",
  "xmark": "close",
  "checkmark": "check",
  "minus.circle.fill": "remove-circle",
  "doc.text.fill": "description",
  "square.and.arrow.up": "share",
  "arrow.left": "arrow-back",
} as IconMapping;

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
