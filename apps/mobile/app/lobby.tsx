import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackUnoLogo } from '../src/components/StackUnoLogo.js';
import { GoldenButton } from '../src/components/GoldenButton.js';
import { DangerButton } from '../src/components/DangerButton.js';
import { RoomCode } from '../src/components/RoomCode.js';
import { PlayerAvatar } from '../src/components/PlayerAvatar.js';
import { ErrorMessage } from '../src/components/ErrorMessage.js';
import { useGameStore } from '../src/store/game-store.js';
import { colors } from '../src/theme/colors.js';

export default function LobbyScreen() {
  const router = useRouter();
  const { room, playerId, startGame, leaveRoom, errorMessage, clearError, gameState } =
    useGameStore();

  const [loading, setLoading] = useState(false);

  // If game starts, navigate to the game screen automatically
  useEffect(() => {
    if (gameState && gameState.status === 'in_progress' && room) {
      router.replace(`/game/${room.code}`);
    }
  }, [gameState, room, router]);

  if (!room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active room found.</Text>
          <DangerButton title="RETURN HOME" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const isHost = room.hostId === playerId;
  const canStart = room.playerCount >= 2;

  const handleStart = async () => {
    setLoading(true);
    clearError();
    const success = await startGame();
    setLoading(false);
    if (success) {
      router.replace(`/game/${room.code}`);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StackUnoLogo size="small" />

        {/* Room Code */}
        <View style={styles.codeWrapper}>
          <RoomCode code={room.code} />
        </View>

        {/* Room Info Banner */}
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>
            MODE: {room.gameMode === 'reverse' ? 'UNO REVERSE' : 'CLASSIC UNO'}
          </Text>
          <Text style={styles.countText}>
            PLAYERS: {room.playerCount} / {room.maxPlayers}
          </Text>
        </View>

        <ErrorMessage message={errorMessage} onDismiss={clearError} />

        {/* Player Roster (up to 10 slots) */}
        <View style={styles.rosterSection}>
          <Text style={styles.sectionTitle}>PLAYERS IN LOBBY</Text>
          <View style={styles.playerList}>
            {room.players.map((p, idx) => {
              const isMe = p.id === playerId;
              return (
                <View
                  key={p.id}
                  style={[styles.playerItem, isMe && styles.myPlayerItem]}
                >
                  <PlayerAvatar
                    name={p.name}
                    isHost={p.isHost}
                    isConnected={p.isConnected}
                    size={42}
                  />
                  <View style={styles.playerDetails}>
                    <Text numberOfLines={1} style={[styles.playerName, isMe && styles.myPlayerName]}>
                      {p.name} {isMe ? '(You)' : ''}
                    </Text>
                    <Text style={styles.playerMeta}>
                      {p.isHost ? '👑 Room Host' : `Slot #${idx + 1}`} • {p.isConnected ? 'Connected' : 'Offline'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Host Controls or Player Waiting Info */}
        <View style={styles.actions}>
          {isHost ? (
            <>
              <GoldenButton
                title={canStart ? 'START GAME' : 'WAITING FOR PLAYERS (MIN 2)'}
                onPress={handleStart}
                loading={loading}
                disabled={!canStart}
              />
              <DangerButton
                title="LEAVE ROOM"
                onPress={handleLeave}
              />
            </>
          ) : (
            <>
              <View style={styles.waitingNotice}>
                <Text style={styles.waitingText}>
                  Waiting for room host to start the match...
                </Text>
              </View>
              <DangerButton
                title="LEAVE ROOM"
                onPress={handleLeave}
              />
            </>
          )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  codeWrapper: {
    marginVertical: 12,
  },
  modeBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },
  modeText: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  countText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  rosterSection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  playerList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    gap: 12,
  },
  myPlayerItem: {
    borderColor: colors.goldMetallic,
    backgroundColor: '#18140A',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  myPlayerName: {
    color: colors.gold,
  },
  playerMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
  waitingNotice: {
    backgroundColor: colors.surfaceElevated,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  waitingText: {
    color: colors.goldSoft,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
