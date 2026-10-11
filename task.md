# STACK UNO — AGENT DEVELOPMENT SPECIFICATION

> **Product:** STACK UNO  
> **Tagline:** Stack Your Cards. Rule the Game.  
> **Platform:** Android and iOS  
> **Framework:** Expo React Native + TypeScript  
> **Multiplayer:** Local Wi-Fi  
> **Maximum Players:** 10 per room  
> **Game Modes:** Classic UNO and UNO Reverse  
> **Visual Identity:** Premium black, metallic gold, and bright yellow

---

# 1. ROLE AND OBJECTIVE

Act as a senior mobile application engineer, multiplayer game developer, UI/UX designer, and software architect.

Build STACK UNO as a complete, functional, real-time multiplayer card game.

The application must deliver:

- A premium black-and-gold visual identity.
- Support for 2–10 human players in a single game room.
- Local Wi-Fi multiplayer without requiring an external cloud server for gameplay.
- Two selectable game modes: Classic UNO and UNO Reverse.
- Accurate, server-authoritative card rules.
- Responsive layouts for different mobile screen sizes.
- Smooth card animations, polished transitions, and intuitive controls.
- Room creation, room joining, player management, and reconnection.
- Automated tests and reproducible development instructions.

**Do not stop at a UI prototype.** The final application must support a complete game from room creation through victory.

Do not generate the entire application as one enormous, untested code dump. Build it incrementally, validate every stage, and preserve working code.

# 2. PRODUCT IDENTITY

## App name

STACK UNO

## Tagline

Stack Your Cards. Rule the Game.

## Brand personality

- Premium
- Competitive
- Modern
- Minimal
- Playful
- Social

The application should feel like a polished commercial gaming product, not a generic card-game template.

Use the name STACK UNO consistently across the application, navigation, lobby, game screens, documentation, and splash screen.

Create an original text-based logo if custom artwork is unavailable. Do not depend on copyrighted third-party logos.

# 3. TECHNOLOGY STACK

## Mobile application

- Expo React Native
- TypeScript with strict mode
- Expo Router
- React Native Reanimated
- React Native Gesture Handler
- Zustand for local UI state
- Socket.IO Client
- Expo Linear Gradient
- Lucide React Native icons
- React Native Safe Area Context

Use Expo-compatible package versions and verify native-module compatibility before installing dependencies.

## Local multiplayer server

- Node.js
- TypeScript
- Express
- Socket.IO
- Zod for input validation
- Node.js cryptographic utilities for secure room codes and identifiers

## Shared game engine

- Pure TypeScript
- Independent of React Native and Socket.IO
- Deterministic unit tests
- Explicit state transitions
- Reusable rules for both game modes

## Development and testing

- npm workspaces
- ESLint
- Prettier
- Jest or Vitest
- Git
- Environment variables for configurable settings

Avoid adding unnecessary databases, cloud services, authentication providers, or third-party APIs. The first version should work without user accounts.

# 4. SYSTEM ARCHITECTURE

Build a monorepo with three main parts:

```text
stack-uno/
├── AGENTS.md
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── README.md
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── lobby.tsx
│   │   │   ├── create-room.tsx
│   │   │   ├── join-room.tsx
│   │   │   ├── settings.tsx
│   │   │   ├── game/
│   │   │   │   └── [roomId].tsx
│   │   │   └── results.tsx
│   │   └── src/
│   │       ├── components/
│   │       ├── features/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── store/
│   │       ├── theme/
│   │       └── utils/
│   └── server/
│       └── src/
│           ├── index.ts
│           ├── config/
│           ├── rooms/
│           ├── sockets/
│           ├── services/
│           ├── middleware/
│           └── tests/
├── packages/
│   └── game-engine/
│       └── src/
│           ├── types.ts
│           ├── cards.ts
│           ├── deck.ts
│           ├── shuffle.ts
│           ├── rules.ts
│           ├── actions.ts
│           ├── turn-manager.ts
│           ├── game-state.ts
│           ├── scoring.ts
│           └── index.ts
└── docs/
    ├── ARCHITECTURE.md
    ├── GAME_RULES.md
    ├── LAN_SETUP.md
    └── SOCKET_EVENTS.md
```

Adjust the structure when necessary, but preserve the separation between the client, server, and shared game engine.

The client must never be responsible for authoritative game decisions.

# 5. DESIGN SYSTEM — BLACK AND GOLD

## Core visual direction

Use a near-black interface with sophisticated metallic gold details and selective bright yellow highlights.

The UI should feel luxurious and competitive without becoming visually noisy.

### Color tokens

| Token | Hex | Purpose |
|---|---|---|
| Background | `#080808` | Main application background |
| Background Elevated | `#101010` | Screen sections |
| Surface | `#171717` | Cards and panels |
| Surface Elevated | `#222222` | Modal and menu surfaces |
| Primary Gold | `#FFD700` | Primary actions and highlights |
| Metallic Gold | `#D4AF37` | Branding and borders |
| Deep Gold | `#9F7515` | Gradient shadows |
| Soft Gold | `#F5DE9A` | Secondary highlights |
| Bright Yellow | `#FFEB3B` | UNO-related emphasis |
| Primary Text | `#FFFFFF` | Main text |
| Secondary Text | `#A3A3A3` | Supporting text |
| Success | `#4ADE80` | Connected and success states |
| Error | `#FF4545` | Errors and penalties |

Use gold gradients sparingly. Keep text contrast high and ensure controls remain readable.

## Typography

- Use bold, modern display typography for headings.
- Use a clean sans-serif font for body text.
- Use strong number typography for room codes and card values.
- Maintain a clear hierarchy between titles, labels, descriptions, and metadata.

## Components

Build reusable components:

- `StackUnoLogo`
- `GoldenButton`
- `SecondaryButton`
- `GameCard`
- `CardFan`
- `PlayerAvatar`
- `PlayerSeat`
- `TurnIndicator`
- `DirectionIndicator`
- `DrawPile`
- `DiscardPile`
- `ColorPicker`
- `UnoButton`
- `RoomCode`
- `ConnectionBadge`
- `GameModeCard`
- `PlayerLimitSelector`
- `ConfirmationModal`
- `GameResultPanel`
- `LoadingOverlay`
- `ErrorMessage`

Use consistent spacing, rounded corners, subtle shadows, and restrained gold outlines.

Avoid using gold as the background for every component. Reserve the strongest gold treatment for primary actions, active selections, and important game events.

# 6. REQUIRED APPLICATION SCREENS

## 6.1 Splash screen

Display:

- STACK UNO wordmark.
- Black background.
- Metallic gold typography.
- Subtle gold particle or light animation.
- Short transition into the home screen.

Keep the splash animation lightweight and avoid delaying startup unnecessarily.

## 6.2 Home screen

Include:

- STACK UNO branding.
- A prominent Play button.
- Create Room.
- Join Room.
- Classic UNO mode preview.
- UNO Reverse mode preview.
- Settings.
- Connection status when relevant.

Use a visually striking but uncluttered black-and-gold layout.

## 6.3 Create Room screen

Allow the host to configure:

- Display name.
- Game mode.
- Player limit from 2 to 10.
- Optional room password.
- Available rule settings.

Show:

- Generated room code.
- Host server address.
- Network connection status.
- Copy room code action.
- Start Game action.

The game must not start until at least two players have joined.

Only the host may change lobby settings or start the game.

## 6.4 Join Room screen

Support:

1. Joining through a room code.
2. Entering the host's local IP address.
3. Discovering rooms on the same network where supported.

Display:

- Room name or code.
- Current player count.
- Maximum player count.
- Selected game mode.
- Room availability.
- Connection errors.
- Retry and manual connection options.

Never assume a mobile device's `localhost` refers to the host computer.

## 6.5 Lobby screen

Display up to 10 player slots.

Each slot should show:

- Player avatar or initials.
- Display name.
- Host indicator.
- Connection status.
- Ready status, if readiness is implemented.

Host controls:

- Start Game.
- Change permitted room settings.
- Remove a player.
- Copy room code.

Player controls:

- Change display name before the game starts.
- Toggle ready status if required.

Prevent the host from accidentally starting the game with fewer than two players.

## 6.6 Game screen

This is the primary experience. Prioritize gameplay clarity over decoration.

Display:

- Current discard card.
- Draw pile.
- Current active color.
- Turn direction.
- Current player's hand.
- Opponent names and remaining card counts.
- Current player's turn indicator.
- Draw action.
- UNO declaration button.
- Contextual color picker.
- Pending penalty information.
- Connection state.

Arrange opponents around the table in a responsive layout.

For 7–10 players, use compact opponent indicators and an expandable player list when necessary. Never make the table unreadable just to show every avatar at full size.

The player's hand must remain the most prominent interactive area.

## 6.7 Results screen

Display:

- Winner announcement.
- Winner avatar.
- Final player standings.
- Remaining card counts.
- Play Again.
- Return to Lobby.
- Exit Room.

Only allow a new game when the server confirms that the room is ready.

# 7. CARD DESIGN

Create original, recognizable playing-card graphics.

Every card should have:

- A distinct card background.
- Rounded corners.
- A central number or action symbol.
- A smaller corner symbol.
- Strong contrast.
- Subtle depth and shadow.
- A consistent design language.

Support red, blue, green, and yellow card colors.

Use gold accents for the interface, not as a replacement for the four gameplay colors. Players must always be able to distinguish the actual card colors.

Wild cards should use a multicolor visual treatment.

For selected cards, use a restrained gold border or glow.

Cards in the player's hand should support tap selection and legal-play highlighting. Avoid gestures that make card selection difficult.

# 8. MULTIPLAYER REQUIREMENTS

## Player capacity

Support 2–10 players per room, including the host if the host is playing.

The server must enforce the configured player limit.

Reject additional players once the room reaches capacity.

## Room lifecycle

1. Host starts the local server.
2. Host opens STACK UNO.
3. Host creates a room.
4. Server generates a unique room code.
5. Other devices connect over the same Wi-Fi.
6. Players join using the room code or available discovery.
7. Host starts the game.
8. Server deals cards and maintains game state.
9. All clients receive authorized real-time updates.
10. The server determines the winner and publishes the result.

## Local Wi-Fi architecture

Run the multiplayer server on a host computer.

Bind the server to `0.0.0.0` so devices on the local network can connect.

Use the host's private IPv4 address and configured port, for example:

`http://192.168.1.10:3000`

The address is an example only. Detect or document the actual host address rather than hardcoding it.

The mobile client must support configuring the server address.

Provide manual IP entry as a reliable fallback to automatic LAN discovery.

Handle:

- Incorrect IP addresses.
- Firewall restrictions.
- Router client isolation.
- Connection timeouts.
- Server shutdown.
- Duplicate room codes.
- Room capacity errors.
- Unexpected disconnects.

The core game must not depend on a cloud server or external account system.

## Expo compatibility

Prefer Expo Go-compatible packages where possible.

If LAN discovery or another native feature requires a development build, document that requirement and provide the correct Expo configuration.

Configure platform-specific local-network permissions when required.

Do not claim automatic room discovery works on every platform until it has been tested on actual devices.

# 9. GAME MODE A — CLASSIC UNO

Implement a conventional UNO-style game using a documented ruleset.

## Deck

Use the standard 108-card deck:

- 76 number cards.
- 24 action cards: Skip, Reverse, and Draw Two.
- 8 wild cards: four Wild and four Wild Draw Four.

For number cards, use one zero per color and two copies of each number from 1 through 9 per color.

For each color, include two copies of Skip, Reverse, and Draw Two.

## Initial setup

- Support 2–10 players.
- Deal seven cards to each player.
- Keep the remaining cards in a shuffled draw pile.
- Initialize the discard pile according to the documented opening-card rules.
- Set the initial active color and turn direction.
- Select the starting player according to the rules configuration.

Document how opening action cards are resolved. Handle Wild Draw Four opening cards consistently with the selected ruleset.

## Legal card plays

A player may play a card when:

- Its color matches the active color.
- Its number or action symbol matches the top discard.
- It is a valid Wild card.

Wild Draw Four legality must follow the configured rules.

Validate all card plays on the server.

## Card effects

### Skip

The next player loses their turn.

### Reverse

Reverse the direction of play.

With two players, Reverse acts as Skip.

### Draw Two

The affected player draws two cards and loses their turn.

### Wild

The player chooses the next active color.

### Wild Draw Four

The player chooses the next active color and the affected player draws four cards and loses their turn, subject to the configured challenge rules.

## Draw behavior

- Allow drawing when the player has no legal move.
- Define whether a drawn playable card may be played immediately.
- Do not permit repeated drawing outside the configured rules.
- Recycle eligible discard cards when the draw pile is exhausted.
- Prevent recycling the active top discard.
- Define behavior for rare cases where no recyclable cards remain.

## UNO declaration

When a player has one card remaining:

- Support an explicit UNO declaration.
- Show a clear visual indicator.
- Define when a declaration is required.
- Define the penalty for a missed declaration.
- Ensure that simultaneous actions cannot apply the penalty twice.

## Victory

A player wins when they legally play their final card, subject to any pending action resolution required by the selected ruleset.

Once the game finishes:

- Reject further card actions.
- Broadcast the winner.
- Show final standings.
- Allow the host to initiate another game.

## House rules

Optional rules must be explicitly configured and documented.

Do not silently enable stacking, jump-in, seven-zero swaps, or other house rules.

# 10. GAME MODE B — UNO REVERSE

Create a separate selectable mode named UNO Reverse.

The mode should reuse the core card engine while providing its own documented rules preset and presentation.

Do not assume that "UNO Reverse" has one universally defined official ruleset. Implement a clear, deterministic variant.

## Required mechanics

- Use recognizable UNO card identities.
- Emphasize turn-direction changes.
- Animate the direction indicator.
- Keep active color and direction synchronized.
- Clearly identify the next player.
- Preserve server-authoritative legality checks.
- Support 2–10 players.
- Handle Skip and Reverse consistently.
- Handle draw penalties consistently with the chosen rules.
- Support Wild color selection.
- Support UNO declarations and victory.

## Mode-specific rules

Before implementing unique mechanics, write `docs/GAME_RULES.md` with a precise specification.

The mode must differ meaningfully from Classic UNO through its documented reverse-focused rules or rule configuration.

Do not add arbitrary effects or invented cards without defining their behavior.

Use shared engine functions for mechanics common to both modes.

Keep the two modes separate in room configuration so players cannot accidentally change modes after a game starts.

# 11. SHARED GAME ENGINE

The game engine must be pure TypeScript.

It must not import React Native, Expo, Express, Socket.IO, or UI components.

## Required state

Represent:

- Game ID and room ID.
- Game mode.
- Player IDs.
- Seating order.
- Player hands.
- Draw pile.
- Discard pile.
- Active color.
- Current player index.
- Direction of play.
- Pending action.
- Pending penalty.
- UNO declaration state.
- Game status.
- Winner.
- Configured rules.

## Required operations

Implement functions equivalent to:

- `createGame()`
- `createDeck()`
- `shuffleDeck()`
- `dealInitialHands()`
- `getLegalMoves()`
- `playCard()`
- `drawCard()`
- `chooseWildColor()`
- `declareUno()`
- `challengeWildDrawFour()`
- `advanceTurn()`
- `calculateNextPlayer()`
- `applyCardEffect()`
- `checkWinner()`
- `recycleDiscardPile()`
- `getPublicGameState()`
- `getPlayerPrivateState()`

All state-changing operations must validate the requested action before committing changes.

Use immutable state transitions where practical.

Inject a seeded random generator or equivalent test fixture for deterministic tests.

## Invariants

- No player can play a card they do not own.
- No player can play out of turn.
- No illegal card can be played.
- No action-card effect can be applied twice.
- A finished game cannot accept moves.
- Hidden cards must remain private.
- The active player index must always refer to a valid player.
- Turn progression must remain valid in both directions.
- Penalties must be applied exactly once.
- The game cannot continue after a winner is confirmed.

# 12. SERVER-AUTHORITATIVE SECURITY

The server owns:

- The complete deck.
- The deck order.
- All player hands.
- Turn order.
- Active color.
- Card legality.
- Action-card effects.
- Penalties.
- UNO declaration validation.
- Game completion.

Clients may request actions but must never submit a replacement game state.

Validate all inputs using typed schemas and runtime validation.

Use stable player identities and room membership checks.

Prevent:

- Unauthorized room actions.
- Spoofed player IDs.
- Playing another player's cards.
- Out-of-turn moves.
- Duplicate actions.
- Replayed stale commands.
- Private-hand leakage.
- Joining a full room.
- Joining an active game as a new player unless explicitly supported.

Use server-side action IDs or sequence numbers for critical operations.

Keep private hands and hidden deck order out of public broadcasts and logs.

Do not log sensitive connection tokens or private card data.

# 13. SOCKET.IO EVENT CONTRACT

Define the event contract in `docs/SOCKET_EVENTS.md`.

Suggested client-to-server events:

- `room:create`
- `room:join`
- `room:leave`
- `room:set-ready`
- `room:start`
- `room:update-settings`
- `game:play-card`
- `game:draw-card`
- `game:choose-color`
- `game:declare-uno`
- `game:challenge`
- `player:reconnect`

Suggested server-to-client events:

- `room:created`
- `room:joined`
- `room:updated`
- `room:error`
- `game:started`
- `game:state`
- `game:player-update`
- `game:turn-changed`
- `game:card-played`
- `game:card-drawn`
- `game:penalty`
- `game:uno-warning`
- `game:finished`
- `connection:status`

These event names may be adjusted when necessary. Maintain one typed, documented event contract shared between the client and server.

Every critical command should return an acknowledgement containing success or a structured error.

Include sufficient context to validate the room, player, and requested action.

## State synchronization

- Broadcast public game state to authorized room members.
- Send each player their own private hand separately.
- Never broadcast opponents' hands.
- Never send the complete hidden deck order.
- Reject stale or duplicate commands.
- Send a fresh authorized snapshot after reconnection.
- Keep state updates consistent across all clients.

# 14. RECONNECTION AND FAILURE RECOVERY

Implement recovery for temporary network interruptions.

When a player disconnects:

- Preserve the room for a configurable period.
- Mark the player as disconnected.
- Retain their seat and hand during the recovery period.
- Notify the remaining players.
- Allow the same authorized player to reconnect.
- Send a fresh state snapshot after reconnection.

Use server-side session identity and a secure reconnection token where needed.

Do not rely solely on a Socket.IO connection ID as a permanent player identity.

Define behavior when the host disconnects.

If the host is also the server computer, explain that other players cannot continue while that server is offline unless a separate server process remains available.

Do not silently transfer host ownership unless the architecture supports it.

Handle unexpected server termination gracefully and document that in-memory rooms are lost on restart unless persistence is implemented.

# 15. UI ANIMATIONS AND FEEDBACK

Use React Native Reanimated for lightweight animations.

Required effects:

- Cards slide from the draw pile into a hand.
- Played cards move to the discard pile.
- Reverse changes the direction indicator.
- Skip briefly highlights the affected player.
- Draw penalties show a clear count change.
- UNO declaration creates a short visual emphasis.
- Winning triggers a restrained gold celebration.
- Active player's turn receives a subtle gold highlight.
- Buttons respond immediately to touch.

Animation must never control the authoritative game state.

Prevent duplicate submissions during animations.

Keep animations responsive on mid-range Android devices.

Support reduced-motion preferences.

Sound and haptics must be optional and configurable.

# 16. STATE MANAGEMENT

Separate server-owned game state from local interface state.

Server-owned data includes:

- Player hands.
- Active player.
- Draw pile and discard pile.
- Active color.
- Direction.
- Penalties.
- Winner.

Local UI state includes:

- Selected card.
- Open modal.
- Current screen.
- Animation state.
- Settings panel.
- Temporary input values.

Use Zustand for appropriate local state.

Do not create competing authoritative copies of the game engine in multiple client components.

The client renders server snapshots and sends validated action requests.

# 17. TESTING REQUIREMENTS

Write unit tests for:

- Deck composition.
- Deck shuffling.
- Initial dealing.
- Legal and illegal moves.
- Number and color matching.
- Skip effects.
- Reverse effects.
- Reverse with two players.
- Draw Two.
- Wild color selection.
- Wild Draw Four.
- Challenge rules.
- UNO declaration.
- Missed-UNO penalties.
- Final-card victory.
- Draw-pile recycling.
- Ten-player turn progression.
- Both directions of play.
- Finished-game restrictions.

Write server integration tests for:

- Room creation.
- Room joining.
- Maximum capacity.
- Host permissions.
- Game start.
- Playing cards.
- Invalid moves.
- Reconnection.
- Duplicate action rejection.
- Unauthorized actions.
- Private-hand isolation.
- Two simultaneous commands.
- Both game modes.

Test on real Android devices connected to the same Wi-Fi.

Do not claim LAN functionality or successful tests unless they have actually been verified.

# 18. PERFORMANCE AND ACCESSIBILITY

- Aim for smooth 60 FPS animations on supported devices.
- Use stable list keys.
- Avoid unnecessary re-renders of every opponent when one player's count changes.
- Handle device safe areas.
- Support narrow and large phone screens.
- Maintain readable text sizes.
- Keep touch targets comfortably sized.
- Provide accessible labels for interactive controls.
- Do not use color alone to communicate critical game states.
- Ensure the hand remains usable with many cards.
- Avoid excessive blur, shadows, and particle effects.
- Optimize asset size and initial load time.

# 19. DOCUMENTATION

Create a complete `README.md` containing:

- Project overview.
- Technology stack.
- Prerequisites.
- Installation instructions.
- Development commands.
- Starting the multiplayer server.
- Starting the Expo application.
- Connecting real phones over Wi-Fi.
- Finding the host computer's local IP address.
- Firewall troubleshooting.
- Expo Go versus development-build requirements.
- Running tests.
- Building a distributable application.
- Known limitations.

Create `docs/LAN_SETUP.md` with a step-by-step guide for Windows and Linux hosts.

Create `docs/GAME_RULES.md` with precise rules for both modes.

Create `docs/SOCKET_EVENTS.md` with the final event contract and example payloads.

Never include real passwords, private tokens, or secrets in the repository.

# 20. IMPLEMENTATION WORKFLOW

Work incrementally.

## Stage 1 — Repository inspection

- Inspect the existing files.
- Identify the current framework and dependencies.
- Preserve useful code.
- Report missing components and architectural problems.
- Propose a concrete implementation plan.

Do not overwrite existing working code without inspection.

## Stage 2 — Project foundation

- Configure workspaces.
- Configure TypeScript.
- Configure linting and formatting.
- Create the shared game-engine package.
- Confirm development scripts work.

## Stage 3 — Game engine

- Implement deck creation and shuffling.
- Implement legal moves.
- Implement action cards and turn management.
- Specify both game modes.
- Add automated unit tests.
- Fix engine errors before proceeding.

## Stage 4 — Multiplayer server

- Implement room creation and joining.
- Enforce player limits and host permissions.
- Integrate the game engine.
- Implement authoritative action handling.
- Implement private and public state delivery.
- Add integration tests.

## Stage 5 — Local Wi-Fi

- Bind the server to the LAN interface.
- Implement server-address configuration.
- Implement room-code joining.
- Add LAN discovery where supported.
- Document firewall and platform permissions.
- Test using actual phones.

## Stage 6 — Interface

- Implement the design system.
- Build navigation and home screens.
- Build room creation and joining.
- Build the lobby.
- Build the card table.
- Build results and settings screens.

## Stage 7 — Gameplay integration

- Connect UI actions to Socket.IO.
- Display authoritative state.
- Implement card selection.
- Implement color selection and UNO declarations.
- Implement both game modes.
- Test multi-device state synchronization.

## Stage 8 — Polish and resilience

- Add animations and optional feedback.
- Implement reconnection.
- Handle errors and loading states.
- Optimize rendering.
- Validate responsive layouts.

## Stage 9 — Verification

- Run all unit tests.
- Run integration tests.
- Run lint and type checks.
- Verify a complete game.
- Verify 10-player room capacity.
- Test disconnection and reconnection.
- Document all unverified behavior.

After each stage, report:
1. Files created or modified.
2. Features completed.
3. Commands and tests actually run.
4. Errors encountered and resolved.
5. Remaining work.
6. The next stage to implement.

Do not skip stages without explaining why.

# 21. DEFINITION OF DONE

STACK UNO is complete only when:

- The application uses the STACK UNO identity.
- The black-and-gold theme is consistently applied.
- Two distinct game modes are selectable.
- Up to 10 players can join one room.
- Devices can play together over local Wi-Fi.
- The host can create and manage a room.
- The game supports a complete match from dealing to victory.
- Card effects and turn order work correctly.
- The server rejects invalid moves.
- Private cards remain private.
- Temporary player disconnections can be recovered from.
- The interface is responsive and usable on real devices.
- Automated tests pass.
- Setup and troubleshooting documentation is complete.

# 22. FINAL INSTRUCTIONS TO THE CODING AGENT

Begin by inspecting the repository.

Do not immediately generate every file.

First, report the existing project structure, the proposed architecture, the implementation sequence, and any technical constraints.

Then implement Stage 1 and Stage 2 as appropriate.

Prioritize correctness, maintainability, multiplayer reliability, and user experience over unnecessary complexity.

The final result must be a functional multiplayer game, not merely a beautiful mockup.
