import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DiscardPile } from '../../src/components/DiscardPile';
import { DrawPile } from '../../src/components/DrawPile';
import { CardFan } from '../../src/components/CardFan';
import { PlayerSeat } from '../../src/components/PlayerSeat';
import { TurnIndicator } from '../../src/components/TurnIndicator';
import { DirectionIndicator } from '../../src/components/DirectionIndicator';
import { UnoButton } from '../../src/components/UnoButton';
import { ColorPicker } from '../../src/components/ColorPicker';
import { ErrorMessage } from '../../src/components/ErrorMessage';
import { useGameStore } from '../../src/store/game-store';
import { colors } from '../../src/theme/colors';
import { haptic } from '../../src/services/haptics';
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
      await haptic.warning();
      Alert.alert('Not Your Turn', 'Please wait for your turn to play.');
      return;
    }

    if (!legalCardIds.includes(card.id)) {
      await haptic.error();
      Alert.alert('Illegal Move', 'This card does not match the active color or top discard.');
      return;
    }

    setSelectedCardId(card.id);

    // If card is Wild or Wild Draw Four, prompt for color selection
    if (isWildCard(card)) {
      await haptic.mediumImpact();
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    // Play standard card
    await haptic.lightImpact();
    await playCardAction(card.id);
    setSelectedCardId(null);
  };

  const handleColorSelected = async (color: CardColor) => {
    setShowColorPicker(false);
    setSelectedCardId(null);
    await haptic.success();
    if (pendingWildCard) {
      await playCardAction(pendingWildCard.id, color);
      setPendingWildCard(null);
    } else {
      await chooseColorAction(color);
    }
  };

  const handleDrawCard = async () => {
    if (!isMyTurn) return;
    await haptic.lightImpact();
    await drawCardAction();
  };

  const handleDeclareUno = async () => {
    await haptic.success();
    await declareUnoAction();
  };

  const handleCalloutUno = async (targetPlayerId: string) => {
    await haptic.heavyImpact();
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

        {/* Opponents Row around table (supports 2 to 10 players) */}
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

        {/* Central Casino Velvet Game Table */}
        <LinearGradient
          colors={['#0F3A2B', '#09251B', '#051711']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={styles.gameTable}
        >
          {/* Subtle Felt Center Emblem */}
          <View style={styles.tableEmblem}>
            <Text style={styles.tableEmblemText}>STACK UNO • ROYAL FELT</Text>
          </View>
          <View style={styles.tableInner}>
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
        </LinearGradient>

        {/* Action Controls & Hand Info */}
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
    backgroundColor: colors.background,
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
    color: colors.textSecondary,
    fontSize: 16,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  opponentsContainer: {
    height: 88,
    marginTop: 4,
  },
  opponentsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 8,
  },
  gameTable: {
    marginHorizontal: 16,
    paddingVertical: 22,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: '#D4AF37',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  tableEmblem: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    opacity: 0.35,
  },
  tableEmblemText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tableInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  handCountBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  handCountText: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  handContainer: {
    alignItems: 'center',
  },
});
