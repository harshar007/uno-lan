import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackUnoLogo } from '../src/components/StackUnoLogo.js';
import { GoldenButton } from '../src/components/GoldenButton.js';
import { SecondaryButton } from '../src/components/SecondaryButton.js';
import { DangerButton } from '../src/components/DangerButton.js';
import { useGameStore } from '../src/store/game-store.js';
import { colors } from '../src/theme/colors.js';

export default function ResultsScreen() {
  const router = useRouter();
  const { winnerId, standings, room, playerId, startGame, leaveRoom } = useGameStore();

  const isHost = room?.hostId === playerId;
  const winner = standings.find((s) => s.playerId === winnerId) || standings[0];
  const isMeWinner = winner?.playerId === playerId;

  const handlePlayAgain = async () => {
    if (isHost && room) {
      await startGame();
      router.replace(`/game/${room.code}`);
    } else {
      router.replace('/lobby');
    }
  };

  const handleReturnToLobby = () => {
    router.replace('/lobby');
  };

  const handleExit = () => {
    leaveRoom();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StackUnoLogo size="small" />

        {/* Victory Celebration Card */}
        <View style={styles.victoryCard}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.victoryTitle}>
            {isMeWinner ? 'VICTORY IS YOURS!' : `${winner?.playerName || 'Player'} WINS!`}
          </Text>
          <Text style={styles.victorySubtitle}>
            {isMeWinner
              ? 'You stacked your cards and ruled the game.'
              : 'Better luck next hand!'}
          </Text>
        </View>

        {/* Standings Table */}
        <View style={styles.standingsSection}>
          <Text style={styles.sectionTitle}>FINAL MATCH STANDINGS</Text>
          <View style={styles.table}>
            {standings.map((standing) => {
              const isPlayer = standing.playerId === playerId;
              return (
                <View
                  key={standing.playerId}
                  style={[styles.row, isPlayer && styles.myRow]}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{standing.rank}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text numberOfLines={1} style={[styles.playerName, isPlayer && styles.myText]}>
                      {standing.playerName} {isPlayer ? '(You)' : ''}
                    </Text>
                    <Text style={styles.pointsText}>
                      {standing.cardCount} cards left • {standing.points} pts
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actions}>
          {isHost ? (
            <GoldenButton
              title="PLAY AGAIN"
              onPress={handlePlayAgain}
            />
          ) : (
            <GoldenButton
              title="RETURN TO LOBBY"
              onPress={handleReturnToLobby}
            />
          )}
          <DangerButton
            title="EXIT TO MAIN MENU"
            onPress={handleExit}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  victoryCard: {
    backgroundColor: '#1C1608',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  trophy: {
    fontSize: 56,
    marginBottom: 8,
  },
  victoryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 2,
    textAlign: 'center',
  },
  victorySubtitle: {
    fontSize: 13,
    color: colors.goldSoft,
    marginTop: 6,
    textAlign: 'center',
  },
  standingsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  table: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  myRow: {
    borderColor: colors.goldMetallic,
    backgroundColor: '#18140A',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: colors.gold,
    fontWeight: '900',
    fontSize: 14,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  myText: {
    color: colors.gold,
  },
  pointsText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
});
