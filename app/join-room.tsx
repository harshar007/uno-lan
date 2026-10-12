import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackUnoLogo } from '../src/components/StackUnoLogo';
import { GoldenButton } from '../src/components/GoldenButton';
import { SecondaryButton } from '../src/components/SecondaryButton';
import { ErrorMessage } from '../src/components/ErrorMessage';
import { useGameStore } from '../src/store/game-store';
import { COLORS } from '../src/theme/colors';

const HOTSPOT_DEFAULT_HOST = 'tcp://192.168.43.1:3000';

export default function JoinRoomScreen() {
  const router = useRouter();
  const { joinRoom, errorMessage, clearError, playerName, setPlayerName, serverUrl, setServerUrl } =
    useGameStore();

  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState(playerName || 'Player');
  const [hostAddress, setHostAddress] = useState(
    serverUrl.includes('192.168.43.1') ? HOTSPOT_DEFAULT_HOST : serverUrl
  );
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!roomCode.trim() || !name.trim()) return;
    setLoading(true);
    clearError();

    if (hostAddress.trim() !== serverUrl) {
      setServerUrl(hostAddress.trim());
    }
    setPlayerName(name.trim());

    const success = await joinRoom(
      roomCode.trim(),
      name.trim(),
      password.trim() || undefined
    );
    setLoading(false);

    if (success) {
      router.push('/lobby');
    }
  };

  const handleQuickHotspotSelect = () => {
    setHostAddress(HOTSPOT_DEFAULT_HOST);
    setServerUrl(HOTSPOT_DEFAULT_HOST);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StackUnoLogo size="small" />

        <Text style={styles.screenTitle}>JOIN GAME ROOM</Text>

        <ErrorMessage message={errorMessage} onDismiss={clearError} />

        {/* 1-Tap Quick Connect to Hotspot Host Phone */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.hotspotQuickCard}
          onPress={handleQuickHotspotSelect}
        >
          <View style={styles.hotspotQuickHeader}>
            <Text style={styles.hotspotQuickTitle}>⚡ CONNECTING TO FRIEND'S HOTSPOT?</Text>
            <Text style={styles.hotspotQuickBadge}>1-TAP PRESET</Text>
          </View>
          <Text style={styles.hotspotQuickText}>
            Tap here to auto-set host to <Text style={styles.boldGold}>192.168.43.1:3000</Text> (standard phone hotspot gateway). No manual IP typing required!
          </Text>
        </TouchableOpacity>

        {/* Room Code */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ENTER ROOM CODE</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={roomCode}
            onChangeText={(text) => setRoomCode(text.toUpperCase())}
            placeholder="e.g. STK92"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

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

        {/* Host IP Address */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>HOST ADDRESS (HOTSPOT OR LAN)</Text>
          <TextInput
            style={styles.input}
            value={hostAddress}
            onChangeText={setHostAddress}
            placeholder="tcp://192.168.43.1:3000"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>
            Phone Hotspot: tcp://192.168.43.1:3000 • Computer LAN: http://192.168.1.x:3000
          </Text>
        </View>

        {/* Optional Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>ROOM PASSWORD (IF PROTECTED)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (if any)"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            maxLength={15}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GoldenButton
            title="JOIN ROOM"
            onPress={handleJoin}
            loading={loading}
            disabled={!roomCode.trim() || !name.trim()}
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
    marginBottom: 16,
  },
  hotspotQuickCard: {
    backgroundColor: '#1E180A',
    borderWidth: 1.5,
    borderColor: COLORS.primaryGold,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 6,
  },
  hotspotQuickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotspotQuickTitle: {
    color: COLORS.primaryGold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hotspotQuickBadge: {
    color: '#000000',
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '900',
  },
  hotspotQuickText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  boldGold: {
    color: COLORS.primaryGold,
    fontWeight: '800',
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
  codeInput: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    color: COLORS.primaryGold,
    borderColor: COLORS.metallicGold,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  actions: {
    marginTop: 22,
    gap: 12,
  },
});
