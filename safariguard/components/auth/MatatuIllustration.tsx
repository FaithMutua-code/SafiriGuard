// components/auth/MatatuIllustration.tsx
import React from "react";
import Svg, { Rect, Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";
import { COLORS } from "./tokens";

const { ink: INK, primary: PRIMARY, violet: VIOLET, coral: CORAL, mist: MIST } = COLORS;

const PASSENGERS = [
  { x: 56, seated: true },
  { x: 108, seated: false },
  { x: 160, seated: true },
  { x: 212, seated: true },
];

/** Hand-drawn matatu: passengers in the windows, IoT puck on the roof. */
export function MatatuIllustration({ width }: { width: number }) {
  const height = width * (230 / 320);

  return (
    <Svg width={width} height={height} viewBox="0 0 320 230">
      <Ellipse cx={160} cy={216} rx={122} ry={9} fill={INK} opacity={0.12} />

      <Path d="M138 30 Q160 10 182 30" stroke={PRIMARY} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.45} />
      <Path d="M146 38 Q160 26 174 38" stroke={PRIMARY} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Rect x={148} y={46} width={24} height={18} rx={7} fill={INK} />
      <Circle cx={160} cy={55} r={3} fill={CORAL} />

      <Rect x={64} y={62} width={192} height={10} rx={5} fill={VIOLET} />
      <Rect x={30} y={70} width={260} height={116} rx={28} fill={PRIMARY} />
      <Rect x={46} y={80} width={228} height={50} rx={14} fill={INK} />

      {PASSENGERS.map((p) => (
        <React.Fragment key={p.x}>
          <Rect x={p.x} y={86} width={44} height={38} rx={9} fill={MIST} />
          {p.seated && (
            <>
              <Circle cx={p.x + 22} cy={101} r={6.5} fill={PRIMARY} />
              <Path d={`M${p.x + 12} 124 q0 -11 10 -11 q10 0 10 11 Z`} fill={PRIMARY} />
            </>
          )}
        </React.Fragment>
      ))}

      <Rect x={30} y={142} width={260} height={10} fill={CORAL} />
      <Rect x={30} y={156} width={260} height={3} fill="#FFFFFF" opacity={0.55} />
      <SvgText x={160} y={173} fill="#FFFFFF" fontSize={11} fontWeight="800" letterSpacing={3} textAnchor="middle">
        SAFARIGUARD
      </SvgText>

      <Rect x={24} y={176} width={272} height={14} rx={7} fill={INK} />
      <Circle cx={284} cy={162} r={7} fill="#FFD27A" />
      <Circle cx={36} cy={162} r={5} fill={CORAL} />

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