import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameMode } from '@stack-uno/game-engine';
import { COLORS } from '../theme/colors';

interface Props {
  mode: GameMode;
  isSelected: boolean;
  onSelect: () => void;
}

export const GameModeCard: React.FC<Props> = ({ mode, isSelected, onSelect }) => {
  const isReverse = mode === 'reverse';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      style={[styles.card, isSelected && styles.selectedCard]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isSelected && styles.selectedTitle]}>
          {isReverse ? 'UNO REVERSE' : 'CLASSIC UNO'}
        </Text>
        {isSelected && (
          <View style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>SELECTED</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>
        {isReverse
          ? 'Fast-paced momentum reversals. Matching numbers trigger Reverse Surge & card reflection attacks!'
          : 'Traditional authentic 108-card UNO rules with standard action cards and victory conditions.'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    padding: 16,
    marginVertical: 6,
  },
  selectedCard: {
    borderColor: COLORS.primaryGold,
    backgroundColor: '#16140D',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  selectedTitle: {
    color: COLORS.primaryGold,
  },
  selectedTag: {
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedTagText: {
    color: '#080808',
    fontSize: 9,
    fontWeight: '900',
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
