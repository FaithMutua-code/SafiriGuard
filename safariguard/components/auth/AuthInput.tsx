// components/auth/AuthInput.tsx — shared input for login + register
import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

type Props = TextInputProps & {
  label: string;
  icon: React.ComponentProps<typeof IconSymbol>["name"];
};

export const AuthInput = forwardRef<TextInput, Props>(function AuthInput(
  { label, icon, secureTextEntry, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>

      {/* Border width is constant; only colors change on focus, so nothing re-lays out */}
      <View style={[styles.wrapper, focused && styles.wrapperFocused]}>
        <IconSymbol
          name={icon}
          size={17}
          color={focused ? "#6152FF" : "#9AA3B8"}
        />
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor="#B4BBCC"
          secureTextEntry={secureTextEntry && !showPassword}
          autoCorrect={false}
          importantForAutofill="yes"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={10}
          >
            <IconSymbol
              name={showPassword ? "eye.slash.fill" : "eye.fill"}
              size={17}
              color="#9AA3B8"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#3A4160",
    letterSpacing: 0.2,
    marginLeft: 2,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ECEEF6",
    backgroundColor: "#F7F8FC",
  },
  wrapperFocused: {
    borderColor: "#6152FF",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    color: "#0F1226",
    paddingVertical: 0,
  },
});