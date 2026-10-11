import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DiscardPile } from '../../src/components/DiscardPile.js';
import { DrawPile } from '../../src/components/DrawPile.js';
import { CardFan } from '../../src/components/CardFan.js';
import { PlayerSeat } from '../../src/components/PlayerSeat.js';
import { TurnIndicator } from '../../src/components/TurnIndicator.js';
import { DirectionIndicator } from '../../src/components/DirectionIndicator.js';
import { UnoButton } from '../../src/components/UnoButton.js';
import { ColorPicker } from '../../src/components/ColorPicker.js';
import { ErrorMessage } from '../../src/components/ErrorMessage.js';
import { useGameStore } from '../../src/store/game-store.js';
import { COLORS } from '../../src/theme/colors.js';
import { Card, CardColor, isWildCard } from '@stack-uno/game-engine';

export default function GameScreen() {
  const router = useRouter();
  const {
    room,
    playerId,
    gameState,
    myHand,
    legalCardIds,
    canDraw,
    canDeclareUno,
    playCardAction,
    drawCardAction,
    chooseColorAction,
    declareUnoAction,
    calloutUnoAction,
    errorMessage,
    clearError,
    penaltyNotification,
    clearPenaltyNotification,
    winnerId,
  } = useGameStore();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);

  // When game completes, navigate to results screen
  useEffect(() => {
    if (gameState?.status === 'finished' || winnerId) {
      router.replace('/results');
    }
  }, [gameState?.status, winnerId, router]);

  if (!gameState || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading game state...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isMyTurn = gameState.currentPlayerId === playerId;
  const opponents = gameState.players.filter((p) => p.id !== playerId);
  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);

  const handleCardSelect = async (card: Card) => {
    if (!isMyTurn) {
      Alert.alert('Not Your Turn', 'Please wait for your turn to play.');
      return;
    }

    if (!legalCardIds.includes(card.id)) {
      Alert.alert('Illegal Move', 'This card does not match the active color or top discard.');
      return;
    }

    // If card is Wild or Wild Draw Four, prompt for color selection
    if (isWildCard(card)) {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    // Play standard card
    await playCardAction(card.id);
  };

  const handleColorSelected = async (color: CardColor) => {
    setShowColorPicker(false);
    if (pendingWildCard) {
      await playCardAction(pendingWildCard.id, color);
      setPendingWildCard(null);
    } else {
      await chooseColorAction(color);
    }
  };

  const handleDrawCard = async () => {
    if (!isMyTurn) return;
    await drawCardAction();
  };

  const handleDeclareUno = async () => {
    await declareUnoAction();
  };

  const handleCalloutUno = async (targetPlayerId: string) => {
    await calloutUnoAction(targetPlayerId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>
        {/* Top Header: Direction and Turn */}
        <View style={styles.topBar}>
          <DirectionIndicator
            direction={gameState.direction}
            mode={gameState.mode}
          />
          <TurnIndicator
            isMyTurn={isMyTurn}
            currentPlayerName={currentPlayer?.name || 'Player'}
          />
        </View>

        {/* Notifications and Errors */}
        <ErrorMessage message={errorMessage} onDismiss={clearError} />
        {penaltyNotification && (
          <ErrorMessage
            message={penaltyNotification}
            onDismiss={clearPenaltyNotification}
          />
        )}

        {/* Opponents Row (horizontal scroll for up to 9 opponents) */}
        <View style={styles.opponentsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.opponentsScroll}
          >
            {opponents.map((opp) => (
              <PlayerSeat
                key={opp.id}
                name={opp.name}
                cardCount={opp.cardCount}
                isCurrentTurn={gameState.currentPlayerId === opp.id}
                isHost={opp.isHost}
                isConnected={opp.isConnected}
                hasDeclaredUno={opp.hasDeclaredUno}
                canCallout={opp.cardCount === 1 && !opp.hasDeclaredUno}
                onCalloutUno={() => handleCalloutUno(opp.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Center Playing Field: Discard Pile & Draw Pile */}
        <View style={styles.playField}>
          <DrawPile
            count={gameState.drawPileCount}
            canDraw={isMyTurn && canDraw}
            onDraw={handleDrawCard}
          />
          <DiscardPile
            topCard={gameState.topDiscardCard}
            activeColor={gameState.activeColor}
            discardCount={gameState.discardPileCount}
          />
        </View>

        {/* Action Controls (UNO declaration button) */}
        <View style={styles.actionRow}>
          <View style={styles.handCountBadge}>
            <Text style={styles.handCountText}>MY HAND: {myHand.length} CARDS</Text>
          </View>
          <UnoButton
            onPress={handleDeclareUno}
            disabled={!canDeclareUno}
          />
        </View>

        {/* Bottom Hand: Card Fan */}
        <View style={styles.handContainer}>
          <CardFan
            hand={myHand}
            legalCardIds={legalCardIds}
            selectedCardId={selectedCardId}
            onSelectCard={handleCardSelect}
            disabled={!isMyTurn}
          />
        </View>
      </View>

      {/* Wild Color Selection Modal */}
      <ColorPicker
        visible={showColorPicker}
        onSelectColor={handleColorSelected}
        onClose={() => setShowColorPicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  opponentsContainer: {
    height: 70,
    marginTop: 4,
  },
  opponentsScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  playField: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 36,
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  handCountBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  handCountText: {
    color: COLORS.softGold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  handContainer: {
    alignItems: 'center',
  },
});
