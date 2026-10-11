import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import { StackUnoLogo } from '../src/components/StackUnoLogo.js';
import { GoldenButton } from '../src/components/GoldenButton.js';
import { SecondaryButton } from '../src/components/SecondaryButton.js';
import { ConnectionBadge } from '../src/components/ConnectionBadge.js';
import { useGameStore } from '../src/store/game-store.js';
import { colors } from '../src/theme/colors.js';
import { haptic } from '../src/services/haptics.js';

export default function SettingsScreen() {
  const router = useRouter();
  const { serverUrl, setServerUrl, connectionStatus, connectSocket } = useGameStore();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [testing, setTesting] = useState(false);
  const [deviceIp, setDeviceIp] = useState<string | null>(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(haptic.isEnabled());

  useEffect(() => {
    async function loadNetworkInfo() {
      try {
        const ip = await Network.getIpAddressAsync();
        setDeviceIp(ip);
      } catch {
        setDeviceIp(null);
      }
    }
    loadNetworkInfo();
  }, []);

  const handleToggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    haptic.setEnabled(val);
    if (val) {
      haptic.success();
    }
  };

  const handleSaveAndTest = async () => {
    setServerUrl(inputUrl);
    setTesting(true);

    try {
      const targetUrl = inputUrl.startsWith('http') ? inputUrl : `http://${inputUrl}`;
      const res = await fetch(`${targetUrl}/api/health`, { method: 'GET' });
      if (res.ok) {
        connectSocket();
        await haptic.success();
        Alert.alert('Connection Successful', `Successfully connected to host server at ${targetUrl}`);
      } else {
        await haptic.warning();
        Alert.alert('Connection Error', `Server responded with status ${res.status}`);
      }
    } catch {
      await haptic.error();
      Alert.alert(
        'Connection Failed',
        `Unable to reach server at ${inputUrl}. Make sure the host computer has run 'npm run dev:server' and your phone is on the same Wi-Fi network.`
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StackUnoLogo size="small" />

        <Text style={styles.screenTitle}>SETTINGS & LAN SETUP</Text>

        <ConnectionBadge status={connectionStatus} serverUrl={serverUrl} />

        {/* Server Address Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MULTIPLAYER HOST ADDRESS</Text>
          <Text style={styles.sectionDesc}>
            Configure the LAN IP address of the host computer running the STACK UNO server.
          </Text>

          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://192.168.1.50:3000"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <GoldenButton
            title="SAVE & TEST CONNECTION"
            onPress={handleSaveAndTest}
            loading={testing}
          />
        </View>

        {/* Device Network Info (expo-network) */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>DEVICE NETWORK STATUS</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Your Device LAN IP:</Text>
            <Text style={styles.infoValue}>{deviceIp || 'Detecting...'}</Text>
          </View>
        </View>

        {/* Preferences (Haptics toggle) */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>HAPTICS & FEEDBACK</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vibration / Haptic Touch:</Text>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: '#333333', true: colors.gold }}
              thumbColor={hapticsEnabled ? '#FFFFFF' : '#888888'}
            />
          </View>
        </View>

        {/* How to Connect Devices */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>HOW TO PLAY ON LOCAL WI-FI</Text>
          <Text style={styles.guideStep}>
            1. Connect host computer and mobile phones to the same Wi-Fi router.
          </Text>
          <Text style={styles.guideStep}>
            2. On host computer, run: <Text style={styles.codeText}>npm run dev:server</Text>
          </Text>
          <Text style={styles.guideStep}>
            3. The server terminal will print your local IP (e.g. <Text style={styles.codeText}>http://192.168.1.15:3000</Text>).
          </Text>
          <Text style={styles.guideStep}>
            4. Enter that IP above and tap "Save & Test Connection".
          </Text>
        </View>

        {/* Back Button */}
        <View style={styles.actions}>
          <SecondaryButton title="BACK TO HOME" onPress={() => router.back()} />
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
  screenTitle: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 14,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 10,
    gap: 12,
  },
  sectionTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
    gap: 8,
  },
  infoTitle: {
    color: colors.goldMetallic,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  infoValue: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  guideCard: {
    backgroundColor: '#141414',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    marginVertical: 10,
    gap: 10,
  },
  guideTitle: {
    color: colors.goldSoft,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  guideStep: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  codeText: {
    color: colors.gold,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  actions: {
    marginTop: 20,
  },
});
