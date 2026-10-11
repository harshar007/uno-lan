# STACK UNO System Architecture

## Overview
STACK UNO is designed as a modular monorepo supporting local Wi-Fi real-time multiplayer for 2–10 players.

```
+-------------------------------------------------------+
|                    STACK UNO CLIENT                   |
|  (Expo React Native / Reanimated / Zustand / Socket)  |
+-------------------------------------------------------+
                           |  Socket.IO
                           v
+-------------------------------------------------------+
|                    STACK UNO SERVER                   |
|        (Node.js / Express / Socket.IO / Zod)          |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|                   SHARED GAME ENGINE                  |
|                (@stack-uno/game-engine)               |
+-------------------------------------------------------+
```

## Packages & Applications

### 1. `@stack-uno/game-engine`
- **Responsibility:** Pure rules, state management, deck generation, legal play computation, card actions, turn advancement, and scoring.
- **Constraints:** Zero I/O, deterministic, pure TypeScript.

### 2. `@stack-uno/server`
- **Responsibility:** Room management (2–10 players), room code generation, host authorization, Socket.IO event handling, player session tokens, reconnection windows, LAN broadcasting/binding.
- **Security:** Validates all actions via Zod, rejects illegal turns, strips private opponent hands from room state broadcasts.

### 3. `@stack-uno/mobile`
- **Responsibility:** Responsive mobile UX for iOS, Android, and Web.
- **Visuals:** Premium black `#080808`, metallic gold `#D4AF37`, primary gold `#FFD700`, bright yellow `#FFEB3B`.
- **State Separation:** Zustand stores local UI state (selected card, modals, address input); server state updates through Socket.IO.
