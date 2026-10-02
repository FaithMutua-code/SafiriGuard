// app/welcome.tsx (replace the contents of your current welcome screen)
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Rect,
  Circle,
  Ellipse,
  Path,
  Text as SvgText,
} from "react-native-svg";
import { IconSymbol } from "@/components/ui/icon-symbol";

const INK = "#17104F";
const PRIMARY = "#6152FF";
const VIOLET = "#8B7CFF";
const CORAL = "#FF8A65";
const MIST = "#E6E1FF";

const PILLS = ["Live location", "Passenger count", "Driving safety"];

/** Hand-drawn matatu: passengers in the windows, IoT puck on the roof. */
function MatatuIllustration({ width }: { width: number }) {
  const height = width * (230 / 320);
  const passengers = [
    { x: 56, seated: true },
    { x: 108, seated: false },
    { x: 160, seated: true },
    { x: 212, seated: true },
  ];

  return (
    <Svg width={width} height={height} viewBox="0 0 320 230">
      {/* ground shadow */}
      <Ellipse cx={160} cy={216} rx={122} ry={9} fill={INK} opacity={0.12} />

      {/* signal arcs + IoT puck */}
      <Path
        d="M138 30 Q160 10 182 30"
        stroke={PRIMARY}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={0.45}
      />
      <Path
        d="M146 38 Q160 26 174 38"
        stroke={PRIMARY}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={148} y={46} width={24} height={18} rx={7} fill={INK} />
      <Circle cx={160} cy={55} r={3} fill={CORAL} />

      {/* roof rail */}
      <Rect x={64} y={62} width={192} height={10} rx={5} fill={VIOLET} />

      {/* body */}
      <Rect x={30} y={70} width={260} height={116} rx={28} fill={PRIMARY} />

      {/* window panel */}
      <Rect x={46} y={80} width={228} height={50} rx={14} fill={INK} />
      {passengers.map((p) => (
        <React.Fragment key={p.x}>
          <Rect x={p.x} y={86} width={44} height={38} rx={9} fill={MIST} />
          {p.seated && (
            <>
              <Circle cx={p.x + 22} cy={101} r={6.5} fill={PRIMARY} />
              <Path
                d={`M${p.x + 12} 124 q0 -11 10 -11 q10 0 10 11 Z`}
                fill={PRIMARY}
              />
            </>
          )}
        </React.Fragment>
      ))}

      {/* stripes + brand */}
      <Rect x={30} y={142} width={260} height={10} fill={CORAL} />
      <Rect x={30} y={156} width={260} height={3} fill="#FFFFFF" opacity={0.55} />
      <SvgText
        x={160}
        y={173}
        fill="#FFFFFF"
        fontSize={11}
        fontWeight="800"
        letterSpacing={3}
        textAnchor="middle"
      >
        SAFARIGUARD
      </SvgText>

      {/* bumper + lights */}
      <Rect x={24} y={176} width={272} height={14} rx={7} fill={INK} />
      <Circle cx={284} cy={162} r={7} fill="#FFD27A" />
      <Circle cx={36} cy={162} r={5} fill={CORAL} />

      {/* wheels */}
      {[92, 238].map((cx) => (
        <React.Fragment key={cx}>
          <Circle cx={cx} cy={190} r={23} fill={INK} />
          <Circle cx={cx} cy={190} r={10} fill={MIST} />
          <Circle cx={cx} cy={190} r={4} fill={INK} />
        </React.Fragment>
      ))}
    </Svg>
  );
}

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const [intro] = useState(() => new Animated.Value(0));
  const [bubble] = useState(() => new Animated.Value(0));
  const [float] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(intro, { toValue: 1, duration: 750, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(450),
        Animated.spring(bubble, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [intro, bubble, float]);

  const illoWidth = Math.min(width - 32, 340);
  const circleSize = Math.min(width * 0.82, 340);
  const stageHeight = illoWidth * (230 / 320) + 56;

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const riseY = intro.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#F6F3FF", "#EBE5FF", "#E3DBFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Illustration stage */}
          <Animated.View
            style={[styles.stage, { height: stageHeight, opacity: intro }]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.bigCircle,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  right: -circleSize * 0.1,
                  top: 6,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.softCircle,
                { left: -26, bottom: 4 },
              ]}
            />

            <Animated.View
              style={[styles.illo, { transform: [{ translateY: floatY }] }]}
            >
              <MatatuIllustration width={illoWidth} />
            </Animated.View>

            <Animated.View
              style={[
                styles.bubble,
                {
                  opacity: bubble,
                  transform: [
                    {
                      scale: bubble.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.bubbleText}>Karibu 👋</Text>
              <View style={styles.bubbleTail} />
            </Animated.View>
          </Animated.View>

          {/* Copy + actions */}
          <Animated.View
            style={[
              styles.bottom,
              { opacity: intro, transform: [{ translateY: riseY }] },
            ]}
          >
            <Text style={styles.headline}>
              Your matatu,{"\n"}in your pocket<Text style={styles.dot}>.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Live trips, passenger counts and driving safety for vehicle owners
              across Kenya.
            </Text>

            <View style={styles.pillRow}>
              {PILLS.map((label) => (
                <View key={label} style={styles.pill}>
                  <View style={styles.pillDot} />
                  <Text style={styles.pillText}>{label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(auth)/register" as any)}
              style={styles.ctaShadow}
            >
              <LinearGradient
                colors={[PRIMARY, VIOLET, "#B9A9FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cta}
              >
                <Text style={styles.ctaText}>Get Started</Text>
                <View style={styles.ctaIcon}>
                  <IconSymbol name="arrow.right" size={16} color={PRIMARY} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/(auth)/login" as any)}
              style={styles.signIn}
              hitSlop={8}
            >
              <Text style={styles.signInText}>
                Already have an account?{" "}
                <Text style={styles.signInLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1EDFF" },
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },

  stage: {
    width: "100%",
    marginTop: 8,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bigCircle: { position: "absolute", backgroundColor: "#FFFFFF" },
  softCircle: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: PRIMARY,
    opacity: 0.1,
  },
  illo: { alignItems: "center" },

  bubble: {
    position: "absolute",
    top: 0,
    left: 4,
    backgroundColor: INK,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
  },
  bubbleText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  bubbleTail: {
    position: "absolute",
    bottom: -5,
    left: 26,
    width: 14,
    height: 14,
    backgroundColor: INK,
    transform: [{ rotate: "45deg" }],
  },

  bottom: { width: "100%", paddingTop: 20 },
  headline: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "800",
    color: INK,
    letterSpacing: -1.2,
  },
  dot: { color: PRIMARY },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5B5880",
    marginTop: 12,
  },

  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
    marginBottom: 26,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(97,82,255,0.14)",
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  pillText: { fontSize: 12.5, fontWeight: "600", color: INK },

  ctaShadow: {
    borderRadius: 22,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 8,
  },
  cta: {
    height: 60,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  ctaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  signIn: { alignItems: "center", marginTop: 18 },
  signInText: { fontSize: 14, color: "#6B6890" },
  signInLink: { color: PRIMARY, fontWeight: "800" },
});