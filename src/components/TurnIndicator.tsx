import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  isMyTurn: boolean;
  currentPlayerName: string;
}

export const TurnIndicator: React.FC<Props> = ({ isMyTurn, currentPlayerName }) => {
  return (
    <View style={[styles.container, isMyTurn ? styles.myTurn : styles.otherTurn]}>
      <Text style={[styles.text, isMyTurn ? styles.myTurnText : styles.otherTurnText]}>
        {isMyTurn ? '★ YOUR TURN ★' : `${currentPlayerName}'s Turn`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 4,
  },
  myTurn: {
    backgroundColor: COLORS.primaryGold,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  otherTurn: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: '#333333',
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  myTurnText: {
    color: '#080808',
  },
  otherTurnText: {
    color: COLORS.textSecondary,
  },
});
