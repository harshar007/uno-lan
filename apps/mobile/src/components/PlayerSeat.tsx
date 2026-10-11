import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PlayerAvatar } from './PlayerAvatar.js';
import { colors } from '../theme/colors.js';

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
        size={38}
      />
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, isCurrentTurn && styles.activeName]}>
          {name}
        </Text>
        <View style={styles.cardCountPill}>
          <Text style={styles.cardCountText}>{cardCount} 🂠</Text>
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
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    minWidth: 105,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  activeSeat: {
    backgroundColor: '#1C180C',
    elevation: 4,
  },
  info: {
    flexShrink: 1,
  },
  name: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  activeName: {
    color: colors.gold,
  },
  cardCountPill: {
    marginTop: 2,
  },
  cardCountText: {
    color: colors.goldMetallic,
    fontSize: 11,
    fontWeight: '800',
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
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 4,
  },
  calloutText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
});
