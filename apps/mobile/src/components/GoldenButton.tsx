import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors.js';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GoldenButton: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, style, disabled && styles.disabledWrapper]}
    >
      <LinearGradient
        colors={
          disabled
            ? ['#444444', '#2A2A2A']
            : [COLORS.primaryGold, COLORS.metallicGold, COLORS.deepGold]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#080808" size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledWrapper: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    color: '#080808',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  disabledText: {
    color: '#888888',
  },
});
