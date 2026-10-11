import React from 'react';
import Svg, { Path, Circle, Rect, G, Text as SvgText } from 'react-native-svg';

interface IconProps {
  color: string;
  size: number;
}

/**
 * Authentic UNO Skip symbol: Circle with 45° diagonal slash
 */
export const SkipIcon: React.FC<IconProps> = ({ color, size }) => {
  const strokeWidth = size * 0.18;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // 45 degree angle line endpoints
  const offset = radius * 0.7071;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d={`M ${center - offset} ${center - offset} L ${center + offset} ${center + offset}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * Authentic UNO Reverse symbol: Two curved circulating aerodynamic arrows
 */
export const ReverseIcon: React.FC<IconProps> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Top arrow curving right */}
      <Path
        d="M 22 42 A 28 28 0 0 1 76 34"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 66 18 L 88 34 L 66 50 Z"
        fill={color}
      />

      {/* Bottom arrow curving left */}
      <Path
        d="M 78 58 A 28 28 0 0 1 24 66"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 34 82 L 12 66 L 34 50 Z"
        fill={color}
      />
    </Svg>
  );
};

/**
 * Authentic UNO Draw Two symbol: Two stacked cascading cards with "+2"
 */
export const DrawTwoIcon: React.FC<IconProps> = ({ color, size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Back card */}
      <Rect
        x="40"
        y="12"
        width="38"
        height="56"
        rx="6"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="5"
        transform="rotate(12 59 40)"
      />
      {/* Front card */}
      <Rect
        x="22"
        y="26"
        width="38"
        height="56"
        rx="6"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="5"
        transform="rotate(-10 41 54)"
      />
      {/* Inner card colored oval */}
      <Circle
        cx="41"
        cy="54"
        r="14"
        fill={color}
        transform="rotate(-10 41 54)"
      />
    </Svg>
  );
};

/**
 * Authentic 4-Color Wild Pinwheel:
 * Quadrant segments for Red, Blue, Yellow, Green
 */
export const WildPinwheel: React.FC<{ size: number }> = ({ size }) => {
  const r = 40;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Outer shadow ring */}
      <Circle cx="50" cy="50" r="48" fill="#181818" stroke="#FFFFFF" strokeWidth="3" />

      {/* Top-Left Red Quadrant */}
      <Path
        d="M 50 50 L 50 10 A 40 40 0 0 0 10 50 Z"
        fill="#EA2027"
      />
      {/* Top-Right Blue Quadrant */}
      <Path
        d="M 50 50 L 90 50 A 40 40 0 0 0 50 10 Z"
        fill="#0652DD"
      />
      {/* Bottom-Right Green Quadrant */}
      <Path
        d="M 50 50 L 50 90 A 40 40 0 0 0 90 50 Z"
        fill="#009432"
      />
      {/* Bottom-Left Yellow Quadrant */}
      <Path
        d="M 50 50 L 10 50 A 40 40 0 0 0 50 90 Z"
        fill="#FFC312"
      />

      {/* Inner divider lines */}
      <Path d="M 50 10 L 50 90 M 10 50 L 90 50" stroke="#FFFFFF" strokeWidth="3" />
      {/* Center metallic badge */}
      <Circle cx="50" cy="50" r="10" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2" />
    </Svg>
  );
};

/**
 * Authentic Wild Draw Four:
 * 4 cascading colored cards (Red, Blue, Yellow, Green)
 */
export const WildDrawFourGraphic: React.FC<{ size: number }> = ({ size }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Blue card */}
      <Rect
        x="48"
        y="14"
        width="30"
        height="46"
        rx="5"
        fill="#0652DD"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        transform="rotate(18 63 37)"
      />
      {/* Green card */}
      <Rect
        x="18"
        y="14"
        width="30"
        height="46"
        rx="5"
        fill="#009432"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        transform="rotate(-18 33 37)"
      />
      {/* Yellow card */}
      <Rect
        x="46"
        y="38"
        width="30"
        height="46"
        rx="5"
        fill="#FFC312"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        transform="rotate(6 61 61)"
      />
      {/* Red card */}
      <Rect
        x="22"
        y="36"
        width="30"
        height="46"
        rx="5"
        fill="#EA2027"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        transform="rotate(-6 37 59)"
      />
    </Svg>
  );
};
