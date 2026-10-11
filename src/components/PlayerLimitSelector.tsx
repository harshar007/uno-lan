import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  selectedLimit: number;
  onSelectLimit: (limit: number) => void;
}

export const PlayerLimitSelector: React.FC<Props> = ({ selectedLimit, onSelectLimit }) => {
  const limits = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>MAX PLAYERS (2 - 10)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {limits.map((num) => {
          const isSelected = selectedLimit === num;
          return (
            <TouchableOpacity
              key={num}
              activeOpacity={0.8}
              onPress={() => onSelectLimit(num)}
              style={[styles.pill, isSelected && styles.selectedPill]}
            >
              <Text style={[styles.pillText, isSelected && styles.selectedText]}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scroll: {
    gap: 8,
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPill: {
    borderColor: COLORS.primaryGold,
    backgroundColor: COLORS.primaryGold,
  },
  pillText: {
    color: COLORS.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  selectedText: {
    color: '#080808',
  },
});
