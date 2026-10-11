import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayerAvatar } from './PlayerAvatar.js';
import { COLORS } from '../theme/colors.js';

interface Props {
  name: string;
  cardCount: number;
  isCurrentTurn: boolean;
  isHost?: boolean;
  isConnected?: boolean;
  hasDeclaredUno?: boolean;
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
  onCalloutUno,
  canCallout = false,
}) => {
  return (
    <View style={[styles.seat, isCurrentTurn && styles.activeSeat]}>
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

      {/* Callout UNO Action if player failed to declare UNO */}
      {canCallout && onCalloutUno && (
        <TouchableOpacity
          onPress={onCalloutUno}
          style={styles.calloutBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.calloutText}>CATCH!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  seat: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minWidth: 100,
  },
  activeSeat: {
    borderColor: COLORS.primaryGold,
    backgroundColor: '#1E1A0E',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  info: {
    flexShrink: 1,
  },
  name: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  activeName: {
    color: COLORS.primaryGold,
  },
  cardCountPill: {
    marginTop: 2,
  },
  cardCountText: {
    color: COLORS.metallicGold,
    fontSize: 11,
    fontWeight: '800',
  },
  calloutBtn: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  calloutText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
});
