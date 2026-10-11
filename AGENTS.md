# STACK UNO — AGENT & WORKSPACE GUIDELINES

## Project Overview
STACK UNO is a real-time LAN multiplayer card game built with Expo React Native, TypeScript, Node.js + Socket.IO, and a pure TypeScript game engine.

## Monorepo Layout
- `packages/game-engine`: Pure TypeScript server-authoritative rules, card logic, deck generation, validation, state transitions. Zero external dependencies.
- `apps/server`: Node.js + Express + Socket.IO server running on LAN (`0.0.0.0`), enforcing room lifecycle, hosting up to 10 players, and orchestrating multiplayer matches.
- `apps/mobile`: Expo React Native client supporting iOS, Android, and Web with a luxury black-and-gold visual identity, real-time Socket.IO synchronization, and Reanimated animations.
- `docs/`: Specifications for Architecture, Game Rules, LAN Setup, and Socket Events.

## Architectural Invariants
1. **Server-Authoritative:** The client must never make authoritative game decisions. All moves, draws, and declarations are validated and calculated by `@stack-uno/game-engine` on the server.
2. **Private Hand Isolation:** Opponents' hand cards and hidden deck order are NEVER sent across public broadcasts.
3. **Pure Game Engine:** `@stack-uno/game-engine` must never import React Native, Socket.IO, or Express.
4. **Deterministic Testing:** Game engine functions accept optional seeded PRNGs for repeatable testing.
