# STACK UNO — Premium Black & Gold UI Redesign Prompt

Act as a senior UI/UX designer and Expo React Native developer. Redesign the entire STACK UNO application with a premium black-and-gold gaming aesthetic while preserving the original UNO card colors and gameplay functionality.

## 1. Core Design Concept

Create a luxury multiplayer card-game interface inspired by premium gaming tables, metallic gold finishes, and modern competitive mobile games.

**The main design rule:**
- Application interface = Black and gold.
- Playing cards = Traditional UNO red, blue, green, and yellow.
- Gold = Branding, borders, highlights, buttons, animations, and active-player indicators.
- Black = Backgrounds, game table, navigation, panels, and modal surfaces.

Never recolor all playing cards gold or black. Players must immediately recognize every card's original color and symbol.

## 2. Color System

Implement reusable theme tokens.

```ts
export const colors = {
  background: "#080808",
  backgroundSecondary: "#111111",
  surface: "#181818",
  surfaceElevated: "#222222",

  gold: "#FFD700",
  goldMetallic: "#D4AF37",
  goldDeep: "#9F7515",
  goldSoft: "#F5DE9A",

  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  border: "#343434",

  cardRed: "#ED1C24",
  cardBlue: "#1677E8",
  cardGreen: "#19A84A",
  cardYellow: "#FFD928",

  success: "#4ADE80",
  error: "#FF4545",
};
```

Use these tokens consistently across every screen and component.

## 3. Playing Card Design

Create a reusable `GameCard` component.

Each card must have:
- A rounded rectangular shape.
- A recognizable UNO-inspired color background.
- A contrasting central number or action symbol.
- Smaller matching symbols in the upper-left and lower-right corners.
- A white or appropriately contrasting inner oval or symbol area.
- A subtle shadow for depth.
- A consistent border and spacing system.
- A clear selected-card state.

### Card appearance

**Number cards**
- Red background for red cards.
- Blue background for blue cards.
- Green background for green cards.
- Yellow background for yellow cards.
- Large, readable numbers.

**Action cards**
- Skip: recognizable skip symbol.
- Reverse: recognizable two-arrow reverse symbol.
- Draw Two: +2 symbol.
- Wild: multicolor symbol.
- Wild Draw Four: multicolor symbol and +4.

Use vector icons or custom SVG artwork where appropriate. Do not use emoji as the primary card artwork.

### Gold styling

Apply gold only as a UI enhancement:
- Selected card: thin metallic gold border and subtle glow.
- Playable card: gentle highlight.
- Winning card: short gold animation.
- Disabled card: reduced opacity when the rules permit disabling it.

Do not change the card's base color when selecting or playing it.

## 4. Game Table

Redesign the main gameplay screen with:
- A near-black background.
- A central dark playing table with subtle gradients.
- Thin metallic gold outlines.
- A discard pile in the center.
- A draw pile beside the discard pile.
- A visible active-color indicator.
- A gold turn-direction indicator.
- Player avatars arranged around the table.
- A bottom hand area for the local player's cards.

Keep the table visually clean and ensure the cards remain the main focus.

Do not add excessive particles, blur, or glow effects that reduce performance.

## 5. Player Hand

Create a responsive `CardFan` component.

Requirements:
- Display the local player's cards near the bottom of the screen.
- Overlap cards slightly when the hand is large.
- Keep every card sufficiently visible and selectable.
- Raise the selected card above the others.
- Animate selection smoothly.
- Highlight playable cards without recoloring them.
- Support scrolling or a compact layout when necessary.
- Never make the hand unusable on smaller phones.

Use React Native Reanimated for animations and Gesture Handler where appropriate.

## 6. Buttons and Controls

Create reusable black-and-gold controls.

### Primary button
- Gold gradient or gold fill.
- Dark text.
- Rounded corners.
- Subtle pressed animation.

### Secondary button
- Black or dark-gray surface.
- Gold border.
- White text.
- Gold highlight when selected.

### Danger button
- Dark surface with a red accent.
- Used for leaving a room or destructive actions.

Apply this system to:
- Play.
- Create Room.
- Join Room.
- Start Game.
- Draw Card.
- Declare UNO.
- Choose Color.
- Play Again.
- Return to Lobby.

The UNO button should be prominent and easy to tap.

## 7. Home Screen Redesign

Create a premium landing screen with:
- STACK UNO logo in white and metallic gold.
- A near-black background.
- A restrained golden light effect.
- A clear Play action.
- Separate Classic UNO and UNO Reverse mode cards.
- Create Room and Join Room actions.
- A settings icon.
- A subtle multiplayer indicator.

Use strong typography and generous spacing.

Do not overload the screen with unnecessary menus.

## 8. Classic UNO and UNO Reverse

Keep both game modes inside the same design system.

Classic UNO:
- Traditional card colors.
- Clear active color.
- Standard card effects.
- Gold highlight for the active player.

UNO Reverse:
- The same recognizable card colors.
- A more prominent direction indicator.
- A gold directional animation when Reverse is played.
- Clear next-player information.

The interface must never imply that a card is legal simply because it is highlighted. The server's authoritative game state determines whether a move is allowed.

## 9. Opponent Layout for 2–10 Players

Build a responsive opponent layout.

- 2–4 players: larger avatars and more spacious seating.
- 5–6 players: compact opponent cards around the table.
- 7–10 players: smaller opponent indicators and an expandable player list when necessary.

Each opponent should display:
- Name.
- Avatar or initials.
- Remaining card count.
- Current-turn highlight.
- Connection status when relevant.

Use gold to indicate the current player, not every player simultaneously.

## 10. Room and Lobby Screens

Apply the same premium theme to:
- Create Room.
- Join Room.
- Lobby.
- Room settings.
- Player-ready states.
- Connection errors.

Room codes should be highly readable, using a gold-accented panel.

Use green for connected or ready status and red for errors. Gold remains the primary brand accent.

## 11. Animations

Implement subtle, polished animations:
- Cards lift when selected.
- Cards move toward the discard pile.
- Gold outlines appear on playable or selected cards.
- Reverse animates the direction indicator.
- Skip highlights the affected player.
- UNO declaration creates a short visual emphasis.
- Victory triggers a restrained gold celebration.

Animations must not interfere with turn order, allow duplicate actions, or change game rules.

Respect reduced-motion preferences and keep the interface performant on mid-range Android devices.

## 12. Implementation Rules

Before modifying files:

1. Inspect the existing repository and identify the current UI structure.
2. Reuse existing working navigation, multiplayer logic, and game-engine functions.
3. Identify components that need redesign.
4. Create or update a centralized theme file.
5. Implement reusable card, button, table, and player components.
6. Redesign every screen consistently.
7. Connect the new UI to the existing authoritative game state.
8. Run TypeScript checks, linting, and relevant tests.
9. Fix regressions before declaring completion.

Do not replace functional gameplay with mock data.

Do not rewrite the multiplayer backend unless required to fix a demonstrated issue.

Do not remove existing features simply to simplify the redesign.

## 13. Acceptance Criteria

The redesign is complete when:

- Every application screen uses the black-and-gold design system.
- Playing cards remain recognizably red, blue, green, and yellow.
- Number and action symbols remain readable.
- Selected cards use gold highlights without changing their base colors.
- The table and controls look premium and consistent.
- Both game modes use the same coherent visual language.
- The UI adapts to up to 10 players.
- Existing LAN multiplayer and game rules still work.
- Animations are smooth and do not block gameplay.
- The application builds successfully.

Start by inspecting the repository. Then implement the redesign incrementally, testing each major screen and component before moving to the next.
