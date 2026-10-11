# STACK UNO 👑
> **Stack Your Cards. Rule the Game.**

STACK UNO is a real-time local Wi-Fi multiplayer card game for 2 to 10 players, built with Expo React Native, TypeScript, Node.js + Socket.IO, and a pure TypeScript game engine. Features a luxury black-and-gold visual identity, server-authoritative rules, private hand isolation, and two game modes: **Classic UNO** and **UNO Reverse**.

---

## Features
- **Luxury Black-and-Gold Aesthetics:** Deep black `#080808` table with metallic gold `#D4AF37`, primary gold `#FFD700`, and bright yellow accents.
- **2 to 10 Players:** Real-time synchronized LAN multiplayer with seating, turn management, and opponent indicators.
- **Local Wi-Fi Architecture:** Connects devices on the same local network without requiring external cloud servers or accounts.
- **Two Distinct Game Modes:**
  - **Classic UNO:** Standard 108-card deck with official rules, action cards (Skip, Reverse, Draw Two), and Wild cards.
  - **UNO Reverse:** Fast-paced variant featuring **Reverse Surge** (matching number flips turn direction) and counter-deflection.
- **Server-Authoritative & Secure:** Opponents' hands and hidden deck order are isolated; illegal actions are rejected.
- **Reconnection Support:** Players can reconnect using session tokens during temporary network drops.

---

## Monorepo Layout
```text
stack-uno/
├── AGENTS.md                   # Agent & monorepo guidelines
├── package.json                # Monorepo workspaces definition
├── tsconfig.base.json          # Root TypeScript configuration
├── README.md                   # Project documentation
├── packages/
│   └── game-engine/            # Pure TypeScript server-authoritative engine
│       ├── src/
│       │   ├── cards.ts
│       │   ├── deck.ts
│       │   ├── shuffle.ts
│       │   ├── rules.ts
│       │   ├── actions.ts
│       │   ├── turn-manager.ts
│       │   ├── game-state.ts
│       │   ├── scoring.ts
│       │   └── index.ts
│       └── src/__tests__/      # Automated unit tests
├── apps/
│   ├── server/                 # Node.js + Express + Socket.IO LAN Server
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── rooms/
│   │   │   ├── sockets/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   └── src/__tests__/      # Integration tests
│   └── mobile/                 # Expo React Native mobile client
│       ├── app/                # Expo Router screens
│       └── src/
│           ├── components/     # Black & gold UI components
│           ├── store/          # Zustand client store
│           └── theme/          # Design tokens
└── docs/
    ├── ARCHITECTURE.md         # Monorepo & data flow architecture
    ├── GAME_RULES.md           # Classic & Reverse game mode specifications
    ├── LAN_SETUP.md            # Wi-Fi setup & firewall guide
    └── SOCKET_EVENTS.md        # Socket.IO client-server event contracts
```

---

## Prerequisites
- **Node.js:** v18.0.0 or newer (tested with v24.x)
- **npm:** v9.0.0 or newer (tested with v12.x)
- **Expo Go App:** Installed on iOS or Android test devices (available on App Store / Google Play), or a local web browser.

---

## Quickstart & Installation

1. **Clone and Install Dependencies:**
   ```bash
   git clone <repo-url>
   cd uno
   npm install
   ```

2. **Build Game Engine:**
   ```bash
   npm run build --workspace=@stack-uno/game-engine
   ```

3. **Start the Multiplayer Server (Host Computer):**
   ```bash
   npm run dev:server
   ```
   The terminal will output your computer's local Wi-Fi IP (e.g. `http://192.168.1.15:3000`).

4. **Start the Mobile Application:**
   ```bash
   npm run dev:mobile
   ```
   Press `a` for Android emulator, `i` for iOS simulator, `w` for Web, or scan the QR code using the Expo Go mobile app.

---

## Playing Over Local Wi-Fi (Step-by-Step)

1. Connect the host computer and all phones/devices to the **same Wi-Fi network**.
2. Run `npm run dev:server` on the host computer. Note the LAN address printed in the terminal (e.g., `192.168.1.50:3000`).
3. On the host phone or browser, tap **Create Room**:
   - Choose **Classic UNO** or **UNO Reverse**.
   - Select player limit (2 to 10 players).
   - Tap **Create & Enter Lobby**. A 5-letter Room Code (e.g. `STK84`) will be displayed.
4. On other phones:
   - Open STACK UNO and tap **Join Room** (or open **Settings & LAN Setup** to enter the host IP).
   - Enter the Room Code and Display Name.
   - Tap **Join Room**.
5. Once 2 or more players have joined, the host taps **Start Game**!

---

## Running Tests

### Game Engine Unit Tests (Vitest)
```bash
npm run test --workspace=@stack-uno/game-engine
```
Validates deck composition (108 cards), deterministic PRNG shuffling, action card mechanics (Skip, Reverse, Draw Two, Wild, Wild Draw 4), 10-player turn progression, private hand isolation, and UNO Reverse Surge.

### Server Integration Tests (Vitest)
```bash
npm run test --workspace=@stack-uno/server
```
Validates room creation, room joining, player capacity limits, host permissions, game start, card actions, duplicate command rejection, and session token reconnection.

### Full Test Suite
```bash
npm run test
```

---

## Firewall & Troubleshooting

- **Windows Firewall:** If phones cannot reach the host computer, allow port 3000 in Windows Defender:
  ```powershell
  New-NetFirewallRule -DisplayName "STACK UNO Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
  ```
- **Router Isolation:** Ensure "Client Isolation" or "AP Isolation" is disabled on your Wi-Fi router.
- Refer to `docs/LAN_SETUP.md` for complete operating system instructions.

---

## License
MIT
