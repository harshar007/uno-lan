# STACK UNO — Premium Animation Implementation Prompt

Act as a senior React Native motion designer and animation engineer. Upgrade the entire STACK UNO application with polished, premium animations inspired by high-quality mobile games.

## 1. Animation Identity

App name: STACK UNO

Visual style:
- Deep black backgrounds.
- Metallic gold highlights.
- Bright yellow accents.
- Traditional red, blue, green, and yellow playing cards.
- Smooth transitions, realistic card movement, and restrained glow effects.

Animations should feel fluid, responsive, and intentional. Avoid excessive bouncing, constant particle effects, and distracting transitions.

## 2. Technology

Use:
- Expo React Native.
- TypeScript.
- React Native Reanimated.
- React Native Gesture Handler.
- Expo Linear Gradient where needed.

Prefer native-thread-driven animations when supported. Avoid unnecessary React re-renders during animations.

Before implementation, inspect the installed Expo SDK and use compatible library versions.

## 3. Splash Screen Animation

Create a cinematic STACK UNO opening sequence.

Animation sequence:
1. Fade in a pure-black background.
2. Reveal a thin metallic gold ring with a smooth drawing or scaling effect.
3. Animate several UNO cards into the center from different directions.
4. Reveal the STACK UNO logo with a subtle gold shimmer.
5. Display the tagline: "Stack Your Cards. Rule the Game."
6. Transition smoothly to the home screen.

Keep the intro short and allow users to skip it after the first interaction. Do not replay it unnecessarily whenever navigating between screens.

## 4. Home Screen Animation

Add:
- A subtle animated gold gradient behind the logo.
- Gentle floating card illustrations in the background.
- A small hover-like movement for decorative cards.
- Smooth button press animations.
- Staggered fade-and-slide entrances for the main menu.
- A polished transition when selecting a game mode.

The background must remain mostly black. Decorative animation must not interfere with buttons or touch interactions.

## 5. Card Interaction Animations

Build a reusable animated GameCard component.

### Card entrance
- Animate cards from the draw pile into the player's hand.
- Use a short translation and scale transition.
- Add a slight rotation that settles naturally.

### Card selection
- Raise the selected card above neighboring cards.
- Scale it slightly.
- Add a thin metallic gold outline.
- Apply a restrained gold glow.
- Animate the change smoothly.

### Card deselection
- Return the card to its original position.
- Restore its original scale and rotation.

### Playing a card
- Move the selected card from the hand toward the discard pile.
- Rotate it slightly during travel.
- Scale it down naturally as it reaches the pile.
- Update the UI when the authoritative server confirms the move.

Never remove a card from the authoritative game state merely because its exit animation started.

### Drawing a card
- Animate a card leaving the draw pile.
- Move it toward the player's hand.
- Reveal its face only to the player who owns it.
- Synchronize the animation with the server-confirmed draw event.

### Important
The cards must preserve their original gameplay colors: red, blue, green, and yellow. Gold effects are overlays and borders, not replacements for the card colors.

## 6. Player Hand Animation

Implement a polished CardFan.

Requirements:
- Arrange cards in a subtle fan or overlapping horizontal row.
- Apply small, controlled rotation differences.
- Keep cards readable and selectable.
- Animate card selection independently.
- Reposition neighboring cards smoothly when one card is selected.
- Animate newly drawn cards into the correct position.
- Animate played cards leaving the hand.
- Handle large hands without unnecessary animation delays.

For mobile screens, adapt card width, overlap, and spacing to the available width.

Do not make card selection depend on completing an animation.

## 7. Multiplayer Table Animation

Create a near-black table with subtle metallic gold detailing.

Animate:
- A soft gold pulse around the active player.
- A brief highlight on the current discard pile.
- The direction indicator when Reverse is played.
- A short skip indicator when Skip is played.
- A visible card-count change when a player draws cards.
- Small avatar transitions when player status changes.

Do not continuously animate every opponent. Keep idle animations minimal to preserve battery and performance.

## 8. Action Card Animations

### Skip
- Briefly highlight the affected player's avatar.
- Display a small "SKIPPED" indicator.
- Fade the indicator out smoothly.

### Reverse
- Rotate or sweep the direction indicator.
- Animate the arrow changing direction.
- Briefly highlight the played Reverse card.

### Draw Two and Wild Draw Four
- Animate the penalty count.
- Show cards moving toward the affected player's card area.
- Keep opponents' card faces hidden.
- Display the penalty clearly without blocking the next valid action.

### Wild
- Open a polished color-selection modal.
- Present red, blue, green, and yellow choices as distinct colored buttons.
- Animate the modal in with a short scale-and-fade transition.
- Animate the selected color indicator.
- Close the modal after the server accepts the selection.

## 9. UNO Declaration Animation

When a player declares UNO:
- Briefly emphasize the UNO button.
- Show a bold UNO label with a gold accent.
- Add a quick scale-and-fade effect.
- Optionally play a short sound or haptic response when enabled.

When an opponent declares UNO, show a compact visual notification near their avatar.

Do not allow the animation to submit the declaration more than once.

The game engine remains responsible for declaration timing and penalties.

## 10. Victory Animation

Create a premium victory sequence.

Sequence:
1. Dim the game table slightly.
2. Highlight the winning player.
3. Reveal a gold victory title.
4. Animate a small number of gold particles or confetti elements.
5. Show the final standings.
6. Reveal Play Again and Return to Lobby controls.

Keep the celebration short and avoid heavy full-screen effects.

Provide an option to reduce or skip the celebration.

## 11. Screen Transitions

Use consistent navigation transitions:
- Fade and slight vertical movement for standard screens.
- Short slide transitions for room navigation.
- Smooth modal scale-and-fade animations.
- Subtle gold highlights for selected game modes.

Do not introduce elaborate transitions between every screen. Navigation should feel fast.

Use Expo Router's supported navigation options and Reanimated for custom transitions where appropriate.

## 12. Loading and Connection States

Animate:
- Room creation.
- Joining a room.
- Waiting for players.
- Connecting to the LAN server.
- Reconnecting after a disconnect.
- Starting a match.

Use restrained gold progress indicators on black surfaces.

Show useful status messages instead of leaving the user watching an indefinite animation.

If a request fails, stop the loading animation and display a clear recovery action.

## 13. Animation Timing Guidelines

Use these as starting ranges, then adjust after testing on real devices.

| Interaction | Target duration |
|---|---:|
| Button press | 100–160 ms |
| Card selection | 160–240 ms |
| Card played | 250–400 ms |
| Card drawn | 250–400 ms |
| Modal entrance | 180–280 ms |
| Screen transition | 200–350 ms |
| Reverse effect | 250–450 ms |
| Victory sequence | 800–1500 ms |

Use easing curves that feel natural. Use spring animations selectively for card selection and small UI movements.

These are visual timing targets, not delays in game processing.

## 14. Multiplayer Synchronization

The server is authoritative.

- Start gameplay animations from confirmed server events where appropriate.
- Use optimistic UI only for reversible presentation changes.
- Roll back optimistic changes when the server rejects an action.
- Prevent duplicate card plays.
- Prevent duplicate penalty animations.
- Handle out-of-order or repeated events safely.
- Cancel animations when the relevant component unmounts.
- Keep every client's game state consistent.

Never delay turn progression or card validation just to finish a visual effect.

## 15. Performance Requirements

- Aim for smooth 60 FPS on supported devices.
- Avoid unnecessary state updates on every animation frame.
- Use shared values and derived values appropriately.
- Avoid rendering hundreds of decorative particles.
- Avoid excessive blur and layered shadows.
- Keep animation cleanup reliable.
- Support smaller Android devices.
- Respect reduced-motion preferences.
- Ensure all primary actions remain immediately responsive.

## 16. Implementation Workflow

1. Inspect the current animation setup and dependencies.
2. Identify screens and components requiring animation.
3. Create reusable animation utilities and timing constants.
4. Implement button and modal animations.
5. Implement card selection and card movement.
6. Implement player hand and table animations.
7. Implement action-card effects.
8. Implement screen transitions and loading states.
9. Implement victory effects.
10. Test on real devices and fix performance problems.

After each stage, report the files changed, tests performed, and any remaining issues.

Do not rewrite working gameplay logic to add animations.

Do not replace functional networking with simulated events.

Do not claim performance or device compatibility has been verified unless it has actually been tested.

## 17. Definition of Done

The animation upgrade is complete when:
- The splash and home screens have polished entrances.
- Cards animate when drawn, selected, and played.
- Both game modes animate their special effects correctly.
- Player turns and action-card effects remain synchronized.
- Victory and connection states have clear feedback.
- The UI remains responsive throughout animations.
- The game works with up to 10 players.
- The traditional card colors remain recognizable.
- Reduced-motion settings are respected.
- Existing multiplayer and game rules continue to work.
