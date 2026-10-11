export const SERVER_CONFIG = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  RECONNECT_GRACE_PERIOD_MS: 60 * 1000, // 60 seconds grace period for disconnected players
  MAX_PLAYERS_PER_ROOM: 10,
  MIN_PLAYERS_TO_START: 2,
};
