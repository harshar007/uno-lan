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
  // Compute adaptive overlap based on hand size
  const overlapMargin = hand.length > 10 ? -26 : hand.length > 6 ? -18 : -10;

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

          // Subtle fanning angle based on card position relative to center
          const centerIndex = (hand.length - 1) / 2;
          const normalizedOffset = hand.length > 1 ? (index - centerIndex) / centerIndex : 0;
          const rotateAngle = `${(normalizedOffset * 5).toFixed(1)}deg`;

          return (
            <View
              key={card.id || `card_${index}`}
              style={[
                styles.cardWrapper,
                index > 0 && { marginLeft: overlapMargin },
                {
                  transform: [{ rotate: isSelected ? '0deg' : rotateAngle }],
                  zIndex: isSelected ? 99 : index + 1,
                },
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
    height: 165,
    width: '100%',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'flex-end',
    paddingBottom: 16,
  },
  cardWrapper: {
    alignItems: 'center',
  },
});
