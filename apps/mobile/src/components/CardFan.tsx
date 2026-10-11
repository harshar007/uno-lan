import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card } from '@stack-uno/game-engine';
import { GameCard } from './GameCard.js';

interface Props {
  hand: Card[];
  legalCardIds: string[];
  selectedCardId: string | null;
  onSelectCard: (card: Card) => void;
  disabled?: boolean;
}

export const CardFan: React.FC<Props> = ({
  hand,
  legalCardIds,
  selectedCardId,
  onSelectCard,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hand.map((card, index) => {
          const isSelected = selectedCardId === card.id;
          const isPlayable = legalCardIds.includes(card.id);

          return (
            <View
              key={card.id || `card_${index}`}
              style={[
                styles.cardWrapper,
                index > 0 && { marginLeft: hand.length > 7 ? -18 : -10 },
              ]}
            >
              <GameCard
                card={card}
                size="large"
                isSelected={isSelected}
                isPlayable={isPlayable}
                onPress={() => onSelectCard(card)}
                disabled={disabled}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: '100%',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  cardWrapper: {
    zIndex: 1,
  },
});
