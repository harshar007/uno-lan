import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PlayerAvatar } from './PlayerAvatar';
import { colors } from '../theme/colors';

interface Props {
  name: string;
  cardCount: number;
  isCurrentTurn: boolean;
  isHost?: boolean;
  isConnected?: boolean;
  hasDeclaredUno?: boolean;
  isSkipped?: boolean;
  onCalloutUno?: () => void;
  canCallout?: boolean;
}

export const PlayerSeat: React.FC<Props> = ({
  name,
  cardCount,
  isCurrentTurn,
  isHost = false,
  isConnected = true,
  hasDeclaredUno = false,
  isSkipped = false,
  onCalloutUno,
  canCallout = false,
}) => {
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (isCurrentTurn) {
      pulseOpacity.value = withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      pulseOpacity.value = 0.4;
    }
  }, [isCurrentTurn, pulseOpacity]);

  const activeGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: pulseOpacity.value,
    borderColor: isCurrentTurn ? colors.gold : '#2A2A2A',
  }));

  return (
    <Animated.View style={[styles.seat, isCurrentTurn && styles.activeSeat, activeGlowStyle]}>
      <PlayerAvatar
        name={name}
        isHost={isHost}
        isConnected={isConnected}
        hasDeclaredUno={hasDeclaredUno}
        size={36}
      />
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, isCurrentTurn && styles.activeName]}>
          {name}
        </Text>

        {/* Realistic Mini Face-Down Card Hand */}
        <View style={styles.miniCardStack}>
          <View style={[styles.miniCardBack, styles.miniCardBackUnder]} />
          <View style={styles.miniCardBack}>
            <View style={styles.miniCardRedOval} />
          </View>
          <View style={styles.cardCountBadge}>
            <Text style={styles.cardCountText}>{cardCount}</Text>
          </View>
        </View>
      </View>

      {/* Skipped Badge */}
      {isSkipped && (
        <View style={styles.skippedBadge}>
          <Text style={styles.skippedText}>SKIPPED</Text>
        </View>
      )}

      {/* Catch / Callout UNO Button */}
      {canCallout && onCalloutUno && (
        <TouchableOpacity
          onPress={onCalloutUno}
          style={styles.calloutBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.calloutText}>CATCH!</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  seat: {
    backgroundColor: '#141414',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#262626',
    minWidth: 125,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  activeSeat: {
    backgroundColor: '#1E180A',
    borderColor: colors.gold,
    elevation: 4,
  },
  info: {
    flexShrink: 1,
    gap: 3,
  },
  name: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  activeName: {
    color: colors.gold,
    fontWeight: '800',
  },
  miniCardStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  miniCardBack: {
    width: 14,
    height: 20,
    backgroundColor: '#0F0F0F',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCardBackUnder: {
    position: 'absolute',
    left: -3,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: '#1E1E1E',
  },
  miniCardRedOval: {
    width: 8,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E71D36',
    transform: [{ rotate: '-25deg' }],
  },
  cardCountBadge: {
    backgroundColor: '#262626',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#444444',
  },
  cardCountText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
  },
  skippedBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skippedText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 9,
  },
  calloutBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 2,
  },
  calloutText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
