import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackUnoLogo } from '../src/components/StackUnoLogo.js';
import { GoldenButton } from '../src/components/GoldenButton.js';
import { SecondaryButton } from '../src/components/SecondaryButton.js';
import { GameModeCard } from '../src/components/GameModeCard.js';
import { PlayerLimitSelector } from '../src/components/PlayerLimitSelector.js';
import { ErrorMessage } from '../src/components/ErrorMessage.js';
import { useGameStore } from '../src/store/game-store.js';
import { COLORS } from '../src/theme/colors.js';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { createRoom, errorMessage, clearError, playerName, setPlayerName } = useGameStore();

  const [name, setName] = useState(playerName || 'Host Player');
  const [mode, setMode] = useState<'classic' | 'reverse'>('classic');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    clearError();

    setPlayerName(name.trim());
    const success = await createRoom(
      name.trim(),
      maxPlayers,
      mode,
      password.trim() || undefined
    );
    setLoading(false);

    if (success) {
      router.push('/lobby');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StackUnoLogo size="small" />

        <Text style={styles.screenTitle}>CREATE GAME ROOM</Text>

        <ErrorMessage message={errorMessage} onDismiss={clearError} />

        {/* Player Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>YOUR DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
            maxLength={20}
          />
        </View>

        {/* Game Mode */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>GAME MODE</Text>
          <GameModeCard
            mode="classic"
            isSelected={mode === 'classic'}
            onSelect={() => setMode('classic')}
          />
          <GameModeCard
            mode="reverse"
            isSelected={mode === 'reverse'}
            onSelect={() => setMode('reverse')}
          />
        </View>

        {/* Player Limit */}
        <PlayerLimitSelector
          selectedLimit={maxPlayers}
          onSelectLimit={setMaxPlayers}
        />

        {/* Optional Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ROOM PASSWORD (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Leave empty for public"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            maxLength={15}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GoldenButton
            title="CREATE & ENTER LOBBY"
            onPress={handleCreate}
            loading={loading}
            disabled={!name.trim()}
          />
          <SecondaryButton
            title="BACK"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  screenTitle: {
    color: COLORS.primaryGold,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldGroup: {
    marginVertical: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});
