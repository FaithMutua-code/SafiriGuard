// components/SaccoDropdown.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import api from "@/api/client";

export interface Sacco {
  id: number;
  name: string;
  registration_number: string;
}

interface Props {
  value: Sacco | null;
  onSelect: (sacco: Sacco) => void;
  error?: string;
}

export default function SaccoDropdown({ value, onSelect, error }: Props) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [saccos, setSaccos] = useState<Sacco[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      setFetchError("");
      try {
        const { data } = await api.get("/saccos");
        setSaccos(data.data ?? data); // handles Resource::collection wrapper
      } catch {
        setFetchError("Could not load SACCOs. Check your connection.");
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  const filtered = useMemo(() => {
    if (!query.trim()) return saccos;
    const q = query.toLowerCase();
    return saccos.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, saccos]);

  return (
    <View>
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <IconSymbol name="building.2.fill" size={16} color="#64748B" />
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? value.name : "Select your SACCO *"}
        </Text>
        <IconSymbol name="chevron.down" size={14} color="#64748B" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select SACCO</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <IconSymbol name="xmark" size={18} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
              <IconSymbol name="magnifyingglass" size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search SACCOs..."
                placeholderTextColor="#64748B"
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>

            {loading ? (
              <ActivityIndicator style={{ marginTop: 24 }} color="#6152FF" />
            ) : fetchError ? (
              <Text style={styles.errorText}>{fetchError}</Text>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No SACCOs match {query}</Text>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      onSelect(item);
                      setVisible(false);
                      setQuery("");
                    }}
                  >
                    <Text style={styles.optionName}>{item.name}</Text>
                    <Text style={styles.optionReg}>{item.registration_number}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 52,
  },
  triggerError: { borderColor: "#EF4444" },
  triggerText: { flex: 1, color: "#1E293B", fontSize: 15 },
  placeholder: { color: "#64748B" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: "#00000055", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "75%",
    minHeight: "50%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1E293B" },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  optionName: { fontSize: 15, color: "#1E293B", fontWeight: "600" },
  optionReg: { fontSize: 12, color: "#64748B", marginTop: 2 },
  emptyText: { textAlign: "center", color: "#64748B", marginTop: 24 },
});